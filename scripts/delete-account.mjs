import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const [input, ...flags] = process.argv.slice(2);
const email = (input || "").trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || flags.some(flag => flag !== "--dry-run")) {
  console.error('Usage: node scripts/delete-account.mjs "user@example.com" [--dry-run]');
  process.exit(1);
}

const envFile = fileURLToPath(new URL("../.env.local", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not configured.");
  process.exit(1);
}

// Escaping and anchoring makes this an exact address match, never a partial search.
const filter = { email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } };
const client = new MongoClient(process.env.MONGODB_URI, {
  tls: true,
  family: 4,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
});

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "mdt_hq");
  // This site's live login identities are stored in accounts, not legacy WP users.
  const accounts = db.collection("accounts");
  const matches = await accounts.find(filter, { projection: { _id: 1 } }).toArray();
  console.log(`Database: ${db.databaseName}; matching login accounts: ${matches.length}; email: ${email}`);
  if (flags.includes("--dry-run")) {
    console.log("Preview only. No records deleted.");
  } else if (!matches.length) {
    console.log("No matching login account found.");
  } else {
    // Delete only the records inspected above, even if a new registration races us.
    const result = await accounts.deleteMany({ ...filter, _id: { $in: matches.map(account => account._id) } });
    const remaining = await accounts.countDocuments(filter);
    console.log(`Deleted ${result.deletedCount} login account(s). Remaining matches: ${remaining}.`);
    console.log("Existing sessions will be rejected on their next authenticated request. Quote history is retained.");
    if (remaining) process.exitCode = 1;
  }
} catch (error) {
  // Connection errors may include credentials; report only the error class.
  console.error(`Account deletion failed (${error?.name || "Error"}). Check MongoDB connectivity and configuration.`);
  process.exitCode = 1;
} finally {
  await client.close();
}
