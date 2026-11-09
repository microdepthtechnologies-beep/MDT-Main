import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getDb } from "./mongodb";
import { ObjectId } from "mongodb";

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

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;
        const db = await getDb();
        const account = await db.collection("accounts").findOne({ email });
        if (!account?.passwordHash) return null;
        const valid = await bcrypt.compare(password, account.passwordHash);
        if (!valid) return null;
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
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      const db = await getDb();
      const email = String(user.email || profile?.email || "").toLowerCase();
      if (!email) return false;
      const existing = await db.collection("accounts").findOne({ email });
      if (!existing) {
        const insert = await db.collection("accounts").insertOne({
          email,
          name: user.name || profile?.name || email.split("@")[0],
          role: "customer",
          emailVerified: account?.provider === "google" ? new Date() : null,
          provider: account?.provider || "unknown",
          createdAt: new Date(),
        });
        user.id = insert.insertedId.toString();
        user.role = "customer";
      } else {
        if (account?.provider === "credentials" && (user.passwordVersion || 0) !== (existing.passwordVersion || 0)) return false;
        user.id = existing._id.toString();
        user.role = existing.role || "customer";
        user.passwordVersion = existing.passwordVersion || 0;
        if (account?.provider === "google" && !existing.emailVerified) {
          await db.collection("accounts").updateOne({ _id: existing._id }, { $set: { emailVerified: new Date() } });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.provider = user.provider;
        token.passwordVersion = user.passwordVersion || 0;
      }
      // Password recovery revokes all sessions issued before the reset.
      if (token.sub) {
        if (!ObjectId.isValid(token.sub)) return null;
        const db = await getDb();
        const account = await db.collection("accounts").findOne(
          { _id: new ObjectId(token.sub) }, { projection: { passwordVersion: 1 } },
        );
        if (!account || (account.passwordVersion || 0) !== (token.passwordVersion || 0)) return null;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      if (token?.role) session.user.role = token.role as UserRole;
      if (token?.provider) session.user.provider = token.provider as string;
      return session;
    },
  },
});
