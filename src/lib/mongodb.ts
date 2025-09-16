// This approach is taken from the official Next.js example for MongoDB.
// https://github.com/vercel/next.js/blob/canary/examples/with-mongodb/lib/mongodb.ts
import { MongoClient } from 'mongodb'
import gtoRangesData from './gto-ranges.json';
import explanationsData from './explanations.json';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

// Function to ensure indexes and initial data are set up
async function setupDatabase(client: MongoClient) {
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

    // Check if the collection is empty before inserting data
    const rangesCount = await rangesCollection.countDocuments();
    if (rangesCount === 0 && gtoRangesData?.ranges?.length) {
        console.log("Seeding 'gto-ranges' collection with initial data...");
        await rangesCollection.insertMany(gtoRangesData.ranges);
        console.log(`${gtoRangesData.ranges.length} range documents inserted.`);
    }

    // Index for explanations collection
    const explanationsCollection = db.collection('explanations');
    await explanationsCollection.createIndex({
        position: 1,
        hand: 1,
        action: 1,
        isOptimal: 1,
        'stackRange.min': 1,
        'stackRange.max': 1,
        tableType: 1,
    }, { name: 'explanation_scenario_idx' });

    // Check if the explanations collection is empty before inserting data
    const explanationsCount = await explanationsCollection.countDocuments();
    if (explanationsCount === 0 && explanationsData?.explanations?.length) {
      console.log("Seeding 'explanations' collection with initial data...");
      // We need to transform the data to use stack brackets
      const bracketedExplanations = explanationsData.explanations.map(exp => {
          const { stackSize, ...rest } = exp;
          return {
              ...rest,
              stackRange: getStackBracket(stackSize)
          };
      });
      await explanationsCollection.insertMany(bracketedExplanations);
      console.log(`${bracketedExplanations.length} explanation documents inserted.`);
    }
}

// Helper function to determine stack bracket - must be available here
function getStackBracket(stackSize: number): { min: number; max: number } {
  if (stackSize <= 20) return { min: 1, max: 20 };
  if (stackSize <= 70) return { min: 21, max: 70 };
  return { min: 71, max: 100 };
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
        await setupDatabase(client);
        return client;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect().then(async (client) => {
      await setupDatabase(client);
      return client;
  });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise
