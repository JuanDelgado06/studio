
// This approach is taken from the official Next.js example for MongoDB.
// https://github.com/vercel/next.js/blob/canary/examples/with-mongodb/lib/mongodb.ts
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

// Function to ensure indexes are created
async function ensureIndexes(client: MongoClient) {
    const db = client.db("poker-pro");
    
    // Index for gto-ranges collection
    const rangesCollection = db.collection('gto-ranges');
    await rangesCollection.createIndex({
        position: 1,
        tableType: 1,
        previousAction: 1,
        'stackRange.min': 1,
        'stackRange.max': 1,
    }, { name: 'gto_range_scenario_idx' });

    // Index for explanations collection
    const explanationsCollection = db.collection('explanations');
    await explanationsCollection.createIndex({
        position: 1,
        hand: 1,
        stackSize: 1,
        tableType: 1,
        action: 1,
        isOptimal: 1,
    }, { name: 'explanation_scenario_idx' });
}


if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect().then(async (client) => {
        await ensureIndexes(client);
        return client;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect().then(async (client) => {
      await ensureIndexes(client);
      return client;
  });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

    