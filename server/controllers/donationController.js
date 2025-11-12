import { ObjectId } from "mongodb";
import { getDonationCollection } from "../models/donationModel.js";
import { getActivityCollection } from "../models/activityModel.js";

/**
 * CREATE DONATION
 * Insert donation data and update related activity's collectedMoney
 */
export const createDonation = async (req, res) => {
  try {
    const { userId, activityId, amount } = req.body;

    if (!ObjectId.isValid(activityId)) {
      return res.status(400).json({ message: "Invalid activityId" });
    }
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Donation amount must be greater than 0" });
    }

    const donations = await getDonationCollection();
    const activities = await getActivityCollection();

    // Insert donation record
    const newDonation = {
      userId: new ObjectId(userId),
      activityId: new ObjectId(activityId),
      amount,
      status: "success", // bisa diubah ke 'pending' kalau ada payment gateway
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await donations.insertOne(newDonation);

    // Update collectedMoney in Activity
    await activities.updateOne(
      { _id: new ObjectId(activityId) },
      {
        $inc: { collectedMoney: amount },
        $set: { updatedAt: new Date() },
      }
    );

    res.status(201).json({
      message: "Donation successfully added",
      donationId: insertResult.insertedId,
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ message: "Error creating donation", error: error.message });
  }
};

/**
 * GET ALL DONATIONS (optional filter by activity or user)
 */
export const getDonations = async (req, res) => {
  try {
    const { activityId, userId } = req.query;
    const donations = await getDonationCollection();

    const filter = {};
    if (activityId && ObjectId.isValid(activityId))
      filter.activityId = new ObjectId(activityId);
    if (userId && ObjectId.isValid(userId))
      filter.userId = new ObjectId(userId);

    const list = await donations.find(filter).sort({ createdAt: -1 }).toArray();

    res.status(200).json({ data: list, total: list.length });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ message: "Error fetching donations", error: error.message });
  }
};

/**
 * GET DONATION BY ID
 */
export const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid donation ID" });

    const donations = await getDonationCollection();
    const donation = await donations.findOne({ _id: new ObjectId(id) });

    if (!donation) return res.status(404).json({ message: "Donation not found" });

    res.status(200).json({ data: donation });
  } catch (error) {
    console.error("Error fetching donation:", error);
    res.status(500).json({ message: "Error fetching donation", error: error.message });
  }
};
