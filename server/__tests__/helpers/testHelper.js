import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

let mongoServer;
let connection;
let db;

export const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  connection = await MongoClient.connect(uri);
  db = connection.db();
  
  // Override the connectDB to use test database
  process.env.MONGODB_URI = uri;
  
  return { connection, db };
};

export const teardownTestDB = async () => {
  if (connection) {
    await connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

export const clearDatabase = async () => {
  if (db) {
    const collections = await db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
};

export const getTestDB = () => db;
