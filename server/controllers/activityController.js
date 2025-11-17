import { getActivityCollection } from "../models/activityModel.js";
import { processVolunteerPoints } from "./gamificationController.js";
import { ObjectId } from "mongodb";

// List activities with simple filtering and search
export const getActivities = async (req, res) => {
  try {
    console.log("Getting activities...");
    const collection = await getActivityCollection();
    console.log(" Collection obtained");

    const { search, category, location } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (location) filter.location = { $regex: new RegExp(location, "i") };

    if (search) {
      // simple text search across title and description
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }

    console.log("Filter:", JSON.stringify(filter));
    // Return all matching activities (no pagination)
    const activities = await collection.find(filter).sort({ createdAt: -1 }).toArray();
    console.log(`Found ${activities.length} activities`);

    res.status(200).json({ data: activities, total: activities.length });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Error fetching activities", error: error.message });
  }
};

// Create New Activity (validation handled by middleware)
export const createActivity = async (req, res) => {
  try {
    const payload = req.body;
    const collection = await getActivityCollection();

    const newActivity = {
      title: payload.title,
      description: payload.description,
      location: payload.location ? {
        name: payload.location.name || "",
        lat: payload.location.lat || null,
        lng: payload.location.lng || null,
      } : null,
      images: Array.isArray(payload.images) ? payload.images : [],
      collectedMoney: payload.collectedMoney || 0,
      collectedVolunteer: payload.collectedVolunteer || 0,
      category: payload.category || "",
      targetMoney: payload.targetMoney || 0,
      listVolunteer: Array.isArray(payload.listVolunteer) ? payload.listVolunteer : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newActivity);
    const inserted = await collection.findOne({ _id: result.insertedId });

    res.status(201).json({ message: "Activity created successfully", data: inserted });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ message: "Error creating activity", error });
  }
};

// Get Single Activity by ID
export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });

    const collection = await getActivityCollection();
    const activity = await collection.findOne({ _id: new ObjectId(id) });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json({ data: activity });
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ message: "Error fetching activity", error });
  }
};

// Update Activity
export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });

    const payload = req.body || {};
    // optional: validate payload partially
    const collection = await getActivityCollection();
    const update = {
      ...payload,
      ...(payload.location && {
        location: {
          name: payload.location.name || "",
          lat: payload.location.lat || null,
          lng: payload.location.lng || null,
        },
      }),
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result) return res.status(404).json({ message: "Activity not found" });

    res.status(200).json({ message: "Activity updated", data: result });
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({ message: "Error updating activity", error });
  }
};

// Delete Activity
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });

    const collection = await getActivityCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) return res.status(404).json({ message: "Activity not found" });

    res.status(200).json({ message: "Activity deleted" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ message: "Error deleting activity", error });
  }
};

// Register a volunteer for an activity (validation handled by middleware)
export const registerVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid activity id" });

    const { userId, name, phone, note } = req.body;
    const collection = await getActivityCollection();

    // prevent duplicate registration by same user
    const existing = await collection.findOne({
      _id: new ObjectId(id),
      "listVolunteer.userId": userId,
    });
    if (existing) return res.status(409).json({ message: "User already registered as volunteer" });

    const volunteer = {
      _id: new ObjectId(),
      userId,
      name,
      phone: phone || null,
      note: note || null,
      status: "registered",
      createdAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $push: { listVolunteer: volunteer },
        $inc: { collectedVolunteer: 1 },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: "after" }
    );

    if (!result) return res.status(404).json({ message: "Activity not found" });

    // 🎮 Process gamification points
    await processVolunteerPoints(userId);

    res.status(201).json({ message: "Registered as volunteer", volunteer });
  } catch (error) {
    console.error("Error registering volunteer:", error);
    res.status(500).json({ message: "Error registering volunteer", error });
  }
};

// Unregister volunteer by volunteerId
export const unregisterVolunteer = async (req, res) => {
  try {
    const { id, volunteerId } = req.params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(volunteerId))
      return res.status(400).json({ message: "Invalid id(s)" });

    const collection = await getActivityCollection();

    // First check if volunteer exists
    const activity = await collection.findOne({
      _id: new ObjectId(id),
      "listVolunteer._id": new ObjectId(volunteerId)
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity or volunteer not found" });
    }

    // Remove volunteer and decrement counter (prevent negative)
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $pull: { listVolunteer: { _id: new ObjectId(volunteerId) } },
        $set: {
          collectedVolunteer: Math.max(0, (activity.collectedVolunteer || 1) - 1),
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    if (!result) return res.status(404).json({ message: "Activity not found" });

    res.status(200).json({ message: "Volunteer unregistered", data: result });
  } catch (error) {
    console.error("Error unregistering volunteer:", error);
    res.status(500).json({ message: "Error unregistering volunteer", error: error.message });
  }
};

// Add donation money to an activity
export const addDonation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid activity id" });

    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Valid amount is required" });

    const collection = await getActivityCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $inc: { collectedMoney: amount },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: "after" }
    );

    if (!result) return res.status(404).json({ message: "Activity not found" });

    res.status(200).json({ message: "Donation added", data: result });
  } catch (error) {
    console.error("Error adding donation:", error);
    res.status(500).json({ message: "Error adding donation", error });
  }
};
