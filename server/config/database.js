import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const uri = process.env.MONGO_URL;

if (!uri) {
    console.error("❌ ERROR: MONGO_URL is undefined. Check your .env file location or variable name!");
    process.exit(1);
}

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let db;

export async function connectDB() {
    if (db) return db;
    
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
