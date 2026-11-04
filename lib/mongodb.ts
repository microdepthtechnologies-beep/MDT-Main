import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "mdt_hq";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClient(): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    tls: true,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 0,
    retryWrites: true,
  });
  return client.connect().catch(async error => {
    await client.close().catch(() => undefined);
    throw error;
  });
}

function getClientPromise(): Promise<MongoClient> {
  // Clear a cached rejected promise so the next call retries fresh.
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClient().catch((err) => {
      global._mongoClientPromise = undefined;
      throw err;
    });
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
