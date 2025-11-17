import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { getSubscriptionCollection, getSubscriptionPaymentCollection } from "../../models/subscriptionModel.js";

let mongoServer;
let connection;
let db;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  connection = await MongoClient.connect(uri);
  db = connection.db("careconnect-test");
  global.__MONGO_DB__ = db;
});

afterAll(async () => {
  if (connection) await connection.close();
  if (mongoServer) await mongoServer.stop();
  delete global.__MONGO_DB__;
});

describe("Subscription Model", () => {
  test("getSubscriptionCollection should return subscriptions collection", async () => {
    const collection = await getSubscriptionCollection();
    expect(collection).toBeDefined();
    expect(collection.collectionName).toBe("subscriptions");
  });

  test("getSubscriptionPaymentCollection should return subscriptionPayments collection", async () => {
    const collection = await getSubscriptionPaymentCollection();
    expect(collection).toBeDefined();
    expect(collection.collectionName).toBe("subscriptionPayments");
  });
});
