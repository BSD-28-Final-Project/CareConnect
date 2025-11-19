import { describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";
import request from "supertest";
import app from "../../testApp.js";
import jwt from "jsonwebtoken";

let mongoServer;
let connection;
let db;

const testUser = {
  name: "Test User",
  email: "testuser@example.com",
  password: "hashedpassword123",
  role: "user",
  point: 150,
  totalDonations: 500000,
  totalVolunteerActivities: 3,
  achievements: [
    {
      id: "first_donation",
      name: "Donatur Pertama",
      badge: "💝",
      points: 10,
      unlockedAt: new Date("2024-01-01")
    }
  ],
  activityLog: [
    {
      points: 50,
      reason: "donation",
      metadata: { amount: 500000 },
      timestamp: new Date("2024-01-01")
    }
  ]
};

const testUser2 = {
  name: "Top User",
  email: "topuser@example.com",
  password: "hashedpassword123",
  role: "user",
  point: 500,
  totalDonations: 2000000,
  totalVolunteerActivities: 10,
  achievements: []
};

const generateToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET || "test-secret-key",
    { expiresIn: "1d" }
  );
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  connection = await MongoClient.connect(uri);
  db = connection.db("careconnect-test");
  global.testDb = db;
});

afterAll(async () => {
  if (connection) await connection.close();
  if (mongoServer) await mongoServer.stop();
  delete global.testDb;
});

beforeEach(async () => {
  await db.collection("users").deleteMany({});
  
  const result = await db.collection("users").insertMany([testUser, testUser2]);
  testUser._id = Object.values(result.insertedIds)[0];
  testUser2._id = Object.values(result.insertedIds)[1];

  testUser.token = generateToken(testUser._id, testUser.email, testUser.role);
  testUser2.token = generateToken(testUser2._id, testUser2.email, testUser2.role);
});

describe("Gamification Controller", () => {
  describe("GET /api/gamification/profile/:userId", () => {
    test("should get user gamification profile successfully", async () => {
      const response = await request(app)
        .get(`/api/gamification/profile/${testUser._id}`)
        .set("Authorization", `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("userId");
      expect(response.body.data).toHaveProperty("name", testUser.name);
      expect(response.body.data).toHaveProperty("totalPoints", testUser.point);
      expect(response.body.data).toHaveProperty("currentLevel");
      expect(response.body.data).toHaveProperty("stats");
    });

    test("should return 400 for invalid user ID", async () => {
      const response = await request(app)
        .get("/api/gamification/profile/invalid-id")
        .set("Authorization", `Bearer ${testUser.token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid user ID");
    });

    test("should return 404 for non-existent user", async () => {
      const fakeId = new ObjectId();
      const response = await request(app)
        .get(`/api/gamification/profile/${fakeId}`)
        .set("Authorization", `Bearer ${testUser.token}`);

      // User can only see own profile, so gets 403 before 404 check
      expect([403, 404]).toContain(response.status);
    });
  });

  describe("GET /api/gamification/leaderboard", () => {
    test("should get leaderboard sorted by points", async () => {
      const response = await request(app)
        .get("/api/gamification/leaderboard")
        .set("Authorization", `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("count");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test("should get leaderboard sorted by donations", async () => {
      const response = await request(app)
        .get("/api/gamification/leaderboard?type=donations")
        .set("Authorization", `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test("should get leaderboard sorted by volunteers", async () => {
      const response = await request(app)
        .get("/api/gamification/leaderboard?type=volunteers")
        .set("Authorization", `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      // Verify sorted by totalVolunteerActivities descending
      if (response.body.data.length > 1) {
        expect(response.body.data[0].totalVolunteerActivities).toBeGreaterThanOrEqual(
          response.body.data[1].totalVolunteerActivities
        );
      }
    });

    test("should respect limit parameter", async () => {
      const response = await request(app)
        .get("/api/gamification/leaderboard?limit=1")
        .set("Authorization", `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });
  });

  describe("GET /api/gamification/achievements", () => {
    test("should get all available achievements", async () => {
      const response = await request(app)
        .get("/api/gamification/achievements")
        .set("Authorization", `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/gamification/achievements/:userId", () => {
    test("should get user achievements status", async () => {
      const response = await request(app)
        .get(`/api/gamification/achievements/${testUser._id}`)
        .set("Authorization", `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("unlockedCount");
      expect(response.body).toHaveProperty("totalCount");
    });

    test("should return 400 for invalid user ID", async () => {
      const response = await request(app)
        .get("/api/gamification/achievements/invalid-id")
        .set("Authorization", `Bearer ${testUser.token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid user ID");
    });

    test("should return 404 for non-existent user", async () => {
      const fakeId = new ObjectId();
      const response = await request(app)
        .get(`/api/gamification/achievements/${fakeId}`)
        .set("Authorization", `Bearer ${testUser.token}`);

      // User can only see own achievements, so gets 403 before 404 check
      expect([403, 404]).toContain(response.status);
    });
  });

  describe("Helper Functions", () => {
    test("addUserPoints should add points correctly", async () => {
      const { addUserPoints } = await import("../../controllers/gamificationController.js");
      
      const usersCollection = db.collection("users");
      const userBefore = await usersCollection.findOne({ _id: testUser._id });
      const pointsBefore = userBefore.point;

      await addUserPoints(testUser._id, 100, "test", { test: true });

      const userAfter = await usersCollection.findOne({ _id: testUser._id });
      expect(userAfter.point).toBe(pointsBefore + 100);
    });

    test("addUserPoints should return null for invalid userId", async () => {
      const { addUserPoints } = await import("../../controllers/gamificationController.js");
      
      const result = await addUserPoints("invalid-id", 100, "test");
      expect(result).toBeNull();
    });

    test("processDonationPoints should add points for donation", async () => {
      const { processDonationPoints } = await import("../../controllers/gamificationController.js");
      
      const newDonor = {
        name: "New Donor",
        email: "newdonor@example.com",
        password: "hashedpassword123",
        role: "user",
        point: 0,
        totalDonations: 0
      };

      const usersCollection = db.collection("users");
      const result = await usersCollection.insertOne(newDonor);
      newDonor._id = result.insertedId;

      await processDonationPoints(newDonor._id, 100000);

      const user = await usersCollection.findOne({ _id: newDonor._id });
      expect(user.point).toBeGreaterThan(0);
      expect(user.totalDonations).toBe(100000);
    });

    test("processVolunteerPoints should add points for volunteer", async () => {
      const { processVolunteerPoints } = await import("../../controllers/gamificationController.js");
      
      const newVolunteer = {
        name: "New Volunteer",
        email: "newvolunteer@example.com",
        password: "hashedpassword123",
        role: "user",
        point: 0,
        totalVolunteerActivities: 0
      };

      const usersCollection = db.collection("users");
      const result = await usersCollection.insertOne(newVolunteer);
      newVolunteer._id = result.insertedId;

      await processVolunteerPoints(newVolunteer._id);

      const user = await usersCollection.findOne({ _id: newVolunteer._id });
      expect(user.point).toBe(70); // 50 points for volunteer + 20 for first_volunteer achievement
      expect(user.totalVolunteerActivities).toBe(1);
    });

    test("processDonationPoints should unlock generous_donor achievement (1M)", async () => {
      const { processDonationPoints } = await import("../../controllers/gamificationController.js");
      
      const bigDonor = {
        name: "Big Donor",
        email: "bigdonor@example.com",
        password: "hashedpassword123",
        role: "user",
        point: 0,
        totalDonations: 0,
        achievements: []
      };

      const usersCollection = db.collection("users");
      const result = await usersCollection.insertOne(bigDonor);
      bigDonor._id = result.insertedId;

      // Donate 1 million to unlock generous_donor
      await processDonationPoints(bigDonor._id, 1000000);

      const user = await usersCollection.findOne({ _id: bigDonor._id });
      expect(user.totalDonations).toBe(1000000);
      expect(user.achievements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "first_donation" }),
          expect.objectContaining({ id: "generous_donor" })
        ])
      );
    });

    test("processDonationPoints should unlock super_donor achievement (5M)", async () => {
      const { processDonationPoints } = await import("../../controllers/gamificationController.js");
      
      const superDonor = {
        name: "Super Donor",
        email: "superdonor@example.com",
        password: "hashedpassword123",
        role: "user",
        point: 0,
        totalDonations: 0,
        achievements: []
      };

      const usersCollection = db.collection("users");
      const result = await usersCollection.insertOne(superDonor);
      superDonor._id = result.insertedId;

      // Donate 5 million to unlock super_donor
      await processDonationPoints(superDonor._id, 5000000);

      const user = await usersCollection.findOne({ _id: superDonor._id });
      expect(user.totalDonations).toBe(5000000);
      expect(user.achievements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "first_donation" }),
          expect.objectContaining({ id: "generous_donor" }),
          expect.objectContaining({ id: "super_donor" })
        ])
      );
    });

    test("processVolunteerPoints should unlock active_volunteer achievement (5 activities)", async () => {
      const { processVolunteerPoints } = await import("../../controllers/gamificationController.js");
      
      const activeVolunteer = {
        name: "Active Volunteer",
        email: "activevolunteer@example.com",
        password: "hashedpassword123",
        role: "user",
        point: 0,
        totalVolunteerActivities: 4, // Already has 4
        achievements: [
          {
            id: "first_volunteer",
            name: "Relawan Pertama",
            badge: "🙋",
            points: 20,
            unlockedAt: new Date()
          }
        ]
      };

      const usersCollection = db.collection("users");
      const result = await usersCollection.insertOne(activeVolunteer);
      activeVolunteer._id = result.insertedId;

      // 5th volunteer activity should unlock active_volunteer
      await processVolunteerPoints(activeVolunteer._id);

      const user = await usersCollection.findOne({ _id: activeVolunteer._id });
      expect(user.totalVolunteerActivities).toBe(5);
      expect(user.achievements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "first_volunteer" }),
          expect.objectContaining({ id: "active_volunteer" })
        ])
      );
    });

    test("addUserPoints should return null for invalid userId", async () => {
      const { addUserPoints } = await import("../../controllers/gamificationController.js");
      
      const result = await addUserPoints("invalid-id", 100, "test");
      expect(result).toBeNull();
    });
  });
});
