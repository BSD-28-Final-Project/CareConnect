import { ObjectId } from "mongodb";
import { getDonationCollection } from "../models/donationModel.js";
import { getActivityCollection } from "../models/activityModel.js";
import { processDonationPoints } from "./gamificationController.js";
import { createRequire } from 'module';

// Import Xendit using CommonJS require
const require = createRequire(import.meta.url);
const { Xendit } = require('xendit-node');

// Initialize Xendit
const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || 'xnd_development_dummy_key',
});

/**
 * CREATE DONATION WITH XENDIT PAYMENT
 * Create Xendit invoice and pending donation record
 */
export const createDonation = async (req, res) => {
  try {
    const { userId, activityId, amount, payerEmail, description } = req.body;

    // Validation
    if (!ObjectId.isValid(activityId)) {
      return res.status(400).json({ message: "Invalid activityId" });
    }
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // 🔒 Authorization: User can only create donation for themselves
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "You can only create donations for yourself" });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Donation amount must be greater than 0" });
    }
    if (!payerEmail) {
      return res.status(400).json({ message: "Payer email is required" });
    }

    const donations = await getDonationCollection();
    const activities = await getActivityCollection();

    // Check if activity exists
    const activity = await activities.findOne({ _id: new ObjectId(activityId) });
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    // Create donation record with pending status
    const newDonation = {
      userId: new ObjectId(userId),
      activityId: new ObjectId(activityId),
      amount,
      status: "pending",
      paymentMethod: "xendit",
      xenditInvoiceId: null,
      xenditInvoiceUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await donations.insertOne(newDonation);
    const donationId = insertResult.insertedId.toString();

    // Create Xendit Invoice (v7 API)
    const invoiceData = {
      externalId: donationId, // Use donation ID as external ID
      amount: amount,
      payerEmail: payerEmail,
      description: description || `Donation for ${activity.title}`,
      invoiceDuration: 86400, // 24 hours
      successRedirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/donation/success`,
      failureRedirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/donation/failed`,
      currency: "IDR",
      items: [
        {
          name: activity.title,
          quantity: 1,
          price: amount,
        },
      ],
    };

    const xenditInvoice = await xendit.Invoice.createInvoice({ data: invoiceData });
    
    // Debug: log Xendit response structure
    console.log("Xendit Invoice Response:", JSON.stringify(xenditInvoice, null, 2));

    // Update donation with Xendit invoice details
    await donations.updateOne(
      { _id: new ObjectId(donationId) },
      {
        $set: {
          xenditInvoiceId: xenditInvoice.id,
          xenditInvoiceUrl: xenditInvoice.invoice_url || xenditInvoice.invoiceUrl,
          updatedAt: new Date(),
        },
      }
    );

    res.status(201).json({
      message: "Donation created successfully. Please complete the payment.",
      donationId: donationId,
      invoiceUrl: xenditInvoice.invoice_url || xenditInvoice.invoiceUrl,
      invoiceId: xenditInvoice.id,
      expiryDate: xenditInvoice.expiry_date || xenditInvoice.expiryDate,
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ 
      message: "Error creating donation", 
      error: error.message 
    });
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
    
    // 🔒 Authorization: Non-admin users can only see their own donations
    if (req.user.role !== 'admin') {
      filter.userId = new ObjectId(req.user._id);
    } else {
      // Admin can filter by any userId or activityId
      if (userId && ObjectId.isValid(userId))
        filter.userId = new ObjectId(userId);
    }
    
    if (activityId && ObjectId.isValid(activityId))
      filter.activityId = new ObjectId(activityId);

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

    // 🔒 Authorization: User can only view their own donation (unless admin)
    if (req.user.role !== 'admin' && donation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only view your own donations" });
    }

    res.status(200).json({ data: donation });
  } catch (error) {
    console.error("Error fetching donation:", error);
    res.status(500).json({ message: "Error fetching donation", error: error.message });
  }
};

/**
 * XENDIT WEBHOOK HANDLER
 * Handle payment status updates from Xendit
 */
export const handleXenditWebhook = async (req, res) => {
  try {
    const webhookToken = req.headers["x-callback-token"];
    
    // Verify webhook token
    if (webhookToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return res.status(401).json({ message: "Unauthorized webhook" });
    }

    const { external_id, status, id: invoiceId, paid_amount } = req.body;

    const donations = await getDonationCollection();
    const activities = await getActivityCollection();

    // Find donation by external_id (donation ID)
    const donation = await donations.findOne({ _id: new ObjectId(external_id) });
    
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Update donation status based on Xendit payment status
    if (status === "PAID" || status === "SETTLED") {
      // Update donation to success
      await donations.updateOne(
        { _id: new ObjectId(external_id) },
        {
          $set: {
            status: "success",
            paidAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      // Update activity collectedMoney
      await activities.updateOne(
        { _id: donation.activityId },
        {
          $inc: { collectedMoney: paid_amount || donation.amount },
          $set: { updatedAt: new Date() },
        }
      );

      // 🎮 Process gamification points
      await processDonationPoints(donation.userId.toString(), paid_amount || donation.amount);

      console.log(`✅ Donation ${external_id} paid successfully`);
    } else if (status === "EXPIRED") {
      // Update donation to expired
      await donations.updateOne(
        { _id: new ObjectId(external_id) },
        {
          $set: {
            status: "expired",
            updatedAt: new Date(),
          },
        }
      );

      console.log(`⏰ Donation ${external_id} expired`);
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing Xendit webhook:", error);
    res.status(500).json({ 
      message: "Error processing webhook", 
      error: error.message 
    });
  }
};
