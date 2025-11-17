import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let db;
let client;

export async function connectDB() {
    // For testing, use the global test database
    if (global.testDb) {
        return global.testDb;
    }

    if (db) return db;
    
    const uri = process.env.MONGO_URL;

    if (!uri) {
        console.error("❌ ERROR: MONGO_URL is undefined. Check your .env file location or variable name!");
        process.exit(1);
    }

    client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    });
    
    try {
        await client.connect();
        db = client.db('careconnect');
        console.log('✅ Connected to MongoDB');
        return db;
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        throw error;
    }
}
