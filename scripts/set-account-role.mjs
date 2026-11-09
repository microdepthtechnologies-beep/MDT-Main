import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const [input, role, ...extra] = process.argv.slice(2);
const email = (input || "").trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !["sales", "customer"].includes(role) || extra.length) {
  console.error('Usage: node scripts/set-account-role.mjs "staff@example.com" sales|customer');
  process.exit(1);
}
const envFile = fileURLToPath(new URL("../.env.local", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
if (!process.env.MONGODB_URI) { console.error("MONGODB_URI is not configured."); process.exit(1); }
const client = new MongoClient(process.env.MONGODB_URI, { tls: true, family: 4, serverSelectionTimeoutMS: 15000 });
try {
  await client.connect();
  const accounts = client.db(process.env.MONGODB_DB || "mdt_hq").collection("accounts");
  const account = await accounts.findOne({ email }, { projection: { _id: 1, role: 1 } });
  if (!account) throw new Error("Create the account through the registration page first.");
  if (account.role === "admin") throw new Error("This script does not change administrator roles.");
  await accounts.updateOne({ _id: account._id }, { $set: { role, updatedAt: new Date() }, $inc: { passwordVersion: 1 } });
  console.log(`${email} now has the ${role} role. Sign in again to refresh access.`);
} catch (error) {
  console.error(error.name === "Error" ? error.message : `Role update failed (${error.name}). Check database connectivity.`);
  process.exitCode = 1;
} finally { await client.close(); }
