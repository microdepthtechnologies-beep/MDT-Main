import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getDb } from "./mongodb";
import { sendWelcomeEmail } from "./email";
import { ObjectId } from "mongodb";
import { cleanText, ensureAccountIndexes, isDuplicateKey } from "./accounts";
import { clearRateLimit, consumeRateLimit, isRateLimited } from "./rate-limit";
import { clientIp } from "./request-ip";

export type UserRole = "customer" | "admin" | "sales";
export type MdtUser = {
  _id: ObjectId;
  email: string;
  name: string;
  role: UserRole;
  emailVerified?: Date | null;
  image?: string | null;
  provider?: string;
  passwordVersion?: number;
};

// Sessions end after 30 minutes without activity (every request or client
// heartbeat re-issues the cookie) and, regardless of activity, after 12 hours.
export const SESSION_IDLE_SECONDS = 30 * 60;
const SESSION_ABSOLUTE_SECONDS = 12 * 60 * 60;

// Failed sign-ins are throttled per account and per network source.
const LOGIN_WINDOW = 15 * 60;
const LOGIN_FAILURES_PER_EMAIL = 5;
const LOGIN_FAILURES_PER_IP = 25;

class RateLimitedSignin extends CredentialsSignin { code = "rate_limited"; }

// Comparing against a dummy hash when an account doesn't exist keeps response
// times uniform, so sign-in can't be used to discover which emails are registered.
let dummyHash: Promise<string> | undefined;
const timingSafeMiss = async (password: string) => {
  dummyHash ??= bcrypt.hash("mdt-timing-equaliser", 12);
  await bcrypt.compare(password, await dummyHash);
  return null;
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = String(credentials?.email || "").trim().toLowerCase().slice(0, 254);
        const password = String(credentials?.password || "").slice(0, 200);
        if (!email || !password) return null;
        const ip = clientIp(request?.headers);
        if (
          (await isRateLimited("login-email", email, LOGIN_FAILURES_PER_EMAIL, LOGIN_WINDOW)) ||
          (await isRateLimited("login-ip", ip, LOGIN_FAILURES_PER_IP, LOGIN_WINDOW))
        ) throw new RateLimitedSignin();
        const db = await getDb();
        const account = await db.collection("accounts").findOne({ email });
        const valid = account?.passwordHash ? await bcrypt.compare(password, account.passwordHash) : await timingSafeMiss(password);
        if (!account || !valid) {
          await Promise.all([
            consumeRateLimit("login-email", email, LOGIN_FAILURES_PER_EMAIL, LOGIN_WINDOW),
            consumeRateLimit("login-ip", ip, LOGIN_FAILURES_PER_IP, LOGIN_WINDOW),
          ]);
          return null;
        }
        await clearRateLimit("login-email", email, LOGIN_WINDOW);
        const user: MdtUser = {
          _id: account.userId,
          email: account.email,
          name: account.name,
          role: account.role || "customer",
          emailVerified: account.emailVerified,
          image: account.image,
          provider: "credentials",
          passwordVersion: account.passwordVersion || 0,
        };
        return user;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    newUser: "/dashboard",
  },
  session: { strategy: "jwt", maxAge: SESSION_IDLE_SECONDS, updateAge: 0 },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only trust Google identities whose email Google has verified.
      if (account?.provider === "google" && profile?.email_verified !== true) return false;
      const db = await getDb();
      const email = String(user.email || profile?.email || "").toLowerCase();
      if (!email) return false;
      await ensureAccountIndexes(db);
      let existing = await db.collection("accounts").findOne({ email });
      if (!existing) {
        const name = cleanText(user.name || profile?.name, 120) || email.split("@")[0];
        try {
          const insert = await db.collection("accounts").insertOne({
            email,
            name,
            role: "customer",
            emailVerified: account?.provider === "google" ? new Date() : null,
            provider: account?.provider || "unknown",
            passwordVersion: 0,
            createdAt: new Date(),
          });
          user.id = insert.insertedId.toString();
          user.role = "customer";
          user.passwordVersion = 0;
          try { await sendWelcomeEmail(email, name); }
          catch (mailError) { console.error("Welcome email failed", mailError); }
          return true;
        } catch (error) {
          if (!isDuplicateKey(error)) throw error;
          existing = await db.collection("accounts").findOne({ email });
          if (!existing) return false;
        }
      }
      if (account?.provider === "credentials" && (user.passwordVersion || 0) !== (existing.passwordVersion || 0)) return false;
      if (account?.provider === "google" && !existing.emailVerified) {
        // Pre-account-takeover defence: an unverified email/password account may
        // have been created by someone who doesn't own this inbox. Google has now
        // proven ownership, so retire that password and every session it issued.
        const update = await db.collection("accounts").findOneAndUpdate(
          { _id: existing._id },
          {
            $set: { emailVerified: new Date(), updatedAt: new Date() },
            ...(existing.passwordHash ? { $unset: { passwordHash: "", passwordStrong: "", resetTokenHash: "", resetExpiresAt: "" }, $inc: { passwordVersion: 1 } } : {}),
          },
          { returnDocument: "after" },
        );
        if (update) existing = update;
      }
      user.id = existing._id.toString();
      user.role = existing.role || "customer";
      user.passwordVersion = existing.passwordVersion || 0;
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      const now = Math.floor(Date.now() / 1000);
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.provider = user.provider;
        token.passwordVersion = user.passwordVersion || 0;
        token.authTime = now;
      }
      if (!token.authTime || now - token.authTime > SESSION_ABSOLUTE_SECONDS) return null;
      // Password changes/recovery revoke every session issued before them, and
      // role changes apply immediately rather than at the next sign-in.
      if (token.sub) {
        if (!ObjectId.isValid(token.sub)) return null;
        const db = await getDb();
        const account = await db.collection("accounts").findOne(
          { _id: new ObjectId(token.sub) }, { projection: { passwordVersion: 1, role: 1, passwordHash: 1, passwordStrong: 1 } },
        );
        if (!account || (account.passwordVersion || 0) !== (token.passwordVersion || 0)) return null;
        token.role = account.role || "customer";
        token.passwordUpgradeRequired = !!account.passwordHash && account.passwordStrong !== true;
      }
      if (trigger === "update" && typeof session?.name === "string") {
        const name = cleanText(session.name, 120);
        if (name.length >= 2) token.name = name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      if (token?.role) session.user.role = token.role as UserRole;
      if (token?.provider) session.user.provider = token.provider as string;
      session.user.passwordUpgradeRequired = !!token?.passwordUpgradeRequired;
      return session;
    },
  },
});
