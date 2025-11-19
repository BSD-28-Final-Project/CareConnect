import { getSubscriptionCollection } from "../models/subscriptionModel.js";
import { getActivityCollection } from "../models/activityModel.js";
import { getUserCollection } from "../models/userModel.js";
import { getDonationCollection } from "../models/donationModel.js";
import { ObjectId } from "mongodb";
import { createRequire } from "module";

// Import Xendit using CommonJS require
const require = createRequire(import.meta.url);
const { Xendit } = require("xendit-node");

// Initialize Xendit
const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

// 1. GET SUBSCRIPTION PLANS
export async function getSubscriptionPlans(req, res) {
  try {
    // Static subscription plans
    const plans = [
      {
        _id: "plan-basic",
        name: "Basic",
        amount: 10000,
        description:
          "Donasi rutin setiap bulan untuk mendukung satu kegiatan sosial",
        benefits: [
          "Kontribusi otomatis Rp 10.000/bulan",
          "Update progress kegiatan via email",
          "Badge Basic Supporter",
        ],
      },
      {
        _id: "plan-premium",
        name: "Premium",
        amount: 50000,
        description: "Dukungan lebih besar untuk dampak yang lebih luas",
        benefits: [
          "Kontribusi otomatis Rp 50.000/bulan",
          "Update progress kegiatan via email",
          "Badge Premium Supporter",
          "Laporan bulanan penggunaan dana",
          "Prioritas dukungan customer service",
        ],
      },
      {
        _id: "plan-gold",
        name: "Gold",
        amount: 100000,
        description: "Menjadi champion perubahan dengan donasi maksimal",
        benefits: [
          "Kontribusi otomatis Rp 100.000/bulan",
          "Update progress kegiatan via email",
          "Badge Gold Champion",
          "Laporan bulanan detail penggunaan dana",
          "Prioritas dukungan customer service",
          "Akses ke event volunteer eksklusif",
          "Sertifikat penghargaan tahunan",
        ],
      },
    ];

    res.json({
      success: true,
      data: plans,
    });
  } catch (err) {
    console.error("Get plans error:", err);
    res.status(500).json({ message: "Failed to fetch subscription plans" });
  }
}

// 2. ADD PAYMENT METHOD
export async function addPaymentMethod(req, res) {
  try {
    const users = await getUserCollection();

    // Get userId - handle both ObjectId and object with id property
    const userId = req.user._id || req.user.id || req.user;

    console.log("Add payment method - userId:", userId);
    console.log("Payment method data:", req.body);

    // Create payment method with Xendit
    // Note: For card tokenization, we just save the tokenId to user
    // The actual card token is already created on frontend via Xendit.js
    const tokenId = req.body.tokenId;

    if (!tokenId) {
      return res.status(400).json({ message: "tokenId is required" });
    }

    console.log("Saving tokenId to user:", tokenId);

    // Save tokenId to user document (we'll use this when creating subscription)
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          paymentMethodId: tokenId,
          paymentMethodType: req.body.type || "CARD",
          updatedAt: new Date(),
        },
      }
    );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Payment method added",
      paymentMethodId: tokenId,
    });
  } catch (err) {
    console.error("Add payment method error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      message: "Failed to add payment method",
      error: err.message,
    });
  }
}

// 3. CREATE SUBSCRIPTION
export async function createSubscription(req, res) {
  try {
    const { amount } = req.body;

    // Get userId - handle both ObjectId and object with id property
    const userId = req.user._id || req.user.id || req.user;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const users = await getUserCollection();
    const subs = await getSubscriptionCollection();
    const activities = await getActivityCollection();

    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.paymentMethodId) {
      return res.status(400).json({
        message: "Payment method required. Please add a payment method first.",
      });
    }

    // Find activity with LOWEST collected money
    const targetActivity = await activities.findOne(
      {},
      { sort: { collectedMoney: 1 } } // 1 = ascending, jadi yang paling rendah duluan
    );

    if (!targetActivity) {
      return res
        .status(404)
        .json({ message: "No activity available for subscription" });
    }

    // Create Xendit recurring payment using token
    // Note: The token from frontend needs to be used to create payment method first
    const newRecurring = await xendit.RecurringPayment.create({
      externalId: `recurring-${userId}-${Date.now()}`,
      payerEmail: user.email,
      description: `CareConnect Monthly Donation to ${targetActivity.title}`,
      amount,
      interval: "MONTH",
      intervalCount: 1,
      totalRecurrence: null, // unlimited
      invoiceDuration: 172800, // 2 days
      shouldSendEmail: true,
      missedPaymentAction: "IGNORE",
      creditCardToken: user.paymentMethodId, // use the tokenId from card
    });

    // Save subscription to database
    await subs.insertOne({
      userId: new ObjectId(userId),
      subscriptionId: newRecurring.id,
      amount,
      active: true,
      targetActivityId: targetActivity._id, // Activity target saat subscription dibuat
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: "Subscription created successfully",
      amount,
      targetActivity: {
        id: targetActivity._id,
        title: targetActivity.title,
        collectedMoney: targetActivity.collectedMoney,
      },
      subscriptionId: newRecurring.id,
      nextChargeDate: newRecurring.nextChargeDate,
    });
  } catch (err) {
    console.error("Error creating subscription:", err);
    res
      .status(500)
      .json({ message: "Failed to create subscription", error: err.message });
  }
}

// 4. GET SUBSCRIPTION DETAILS
export async function getSubscriptionDetails(req, res) {
  try {
    const userId = req.user._id || req.user.id || req.user;
    const subs = await getSubscriptionCollection();
    const data = await subs.findOne({
      userId: new ObjectId(userId),
      active: true,
    });
    res.json(data || {});
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch details" });
  }
}

// 5. UPDATE SUBSCRIPTION AMOUNT
export async function updateSubscriptionAmount(req, res) {
  try {
    const userId = req.user._id || req.user.id || req.user;
    const { newAmount } = req.body;
    const subs = await getSubscriptionCollection();

    const current = await subs.findOne({
      userId: new ObjectId(userId),
      active: true,
    });

    await xendit.RecurringPayment.update(current.subscriptionId, {
      amount: newAmount,
    });

    await subs.updateOne(
      { userId: new ObjectId(userId) },
      { $set: { amount: newAmount } }
    );

    res.json({ message: "Subscription amount updated", newAmount });
  } catch (err) {
    res.status(500).json({ message: "Failed to update amount" });
  }
}

// 6. CANCEL SUBSCRIPTION
export async function cancelSubscription(req, res) {
  try {
    const userId = req.user._id || req.user.id || req.user;
    const subs = await getSubscriptionCollection();
    const current = await subs.findOne({
      userId: new ObjectId(userId),
      active: true,
    });

    await xendit.RecurringPayment.disable(current.subscriptionId);

    await subs.updateOne(
      { userId: new ObjectId(userId) },
      { $set: { active: false } }
    );

    res.json({ message: "Subscription cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel subscription" });
  }
}

// 7. LIST HISTORY
export async function getSubscriptionHistory(req, res) {
  try {
    const userId = req.user._id || req.user.id || req.user;
    const subs = await getSubscriptionCollection();

    const list = await subs
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Failed to load history" });
  }
}

// 8. WEBHOOK HANDLER FOR RECURRING PAYMENTS
export async function handleRecurringWebhook(req, res) {
  try {
    const webhookData = req.body;

    console.log(
      "Received recurring payment webhook:",
      JSON.stringify(webhookData, null, 2)
    );

    // Verify webhook is for successful payment
    if (
      webhookData.status !== "SUCCEEDED" &&
      webhookData.event !== "recurring_payment.succeeded"
    ) {
      return res
        .status(200)
        .json({ message: "Webhook received but not a successful payment" });
    }

    const subs = await getSubscriptionCollection();
    const activities = await getActivityCollection();
    const donations = await getDonationCollection();

    // Find subscription by Xendit subscription ID
    const subscription = await subs.findOne({
      subscriptionId:
        webhookData.subscription_id || webhookData.recurring_payment_id,
      active: true,
    });

    if (!subscription) {
      console.log("Subscription not found for webhook");
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Find activity with LOWEST collected money (dinamis setiap bulan)
    const targetActivity = await activities.findOne(
      {},
      { sort: { collectedMoney: 1 } }
    );

    if (!targetActivity) {
      console.log("No activity found for donation distribution");
      return res.status(404).json({ message: "No activity available" });
    }

    const amount = webhookData.amount || subscription.amount;

    // Create donation record
    const newDonation = {
      userId: subscription.userId,
      activityId: targetActivity._id,
      amount: amount,
      status: "paid",
      paymentMethod: "xendit_recurring",
      subscriptionId: subscription._id,
      xenditPaymentId: webhookData.id || webhookData.payment_id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await donations.insertOne(newDonation);

    // Update activity's collected money
    await activities.updateOne(
      { _id: targetActivity._id },
      {
        $inc: { collectedMoney: amount },
        $set: { updatedAt: new Date() },
      }
    );

    // Update subscription last payment date
    await subs.updateOne(
      { _id: subscription._id },
      {
        $set: {
          lastPaymentDate: new Date(),
          lastPaymentAmount: amount,
          lastTargetActivityId: targetActivity._id,
          updatedAt: new Date(),
        },
      }
    );

    console.log(
      `✅ Subscription payment distributed: ${amount} IDR to activity ${targetActivity.title}`
    );

    res.status(200).json({
      message: "Webhook processed successfully",
      donationAmount: amount,
      targetActivity: {
        id: targetActivity._id,
        title: targetActivity.title,
        collectedMoney: targetActivity.collectedMoney + amount,
      },
    });
  } catch (err) {
    console.error("Error processing recurring webhook:", err);
    res
      .status(500)
      .json({ message: "Failed to process webhook", error: err.message });
  }
}

// 9. GET SUBSCRIPTION DONATIONS HISTORY
export async function getSubscriptionDonations(req, res) {
  try {
    const userId = req.user._id || req.user.id || req.user;
    const subs = await getSubscriptionCollection();
    const donations = await getDonationCollection();

    // Find active subscription
    const subscription = await subs.findOne({
      userId: new ObjectId(userId),
      active: true,
    });

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    // Get all donations from this subscription
    const donationHistory = await donations
      .find({ subscriptionId: subscription._id })
      .sort({ createdAt: -1 })
      .toArray();

    // Populate activity details
    const activities = await getActivityCollection();
    const populatedHistory = await Promise.all(
      donationHistory.map(async (donation) => {
        const activity = await activities.findOne({ _id: donation.activityId });
        return {
          ...donation,
          activity: activity
            ? {
                id: activity._id,
                title: activity.title,
                category: activity.category,
              }
            : null,
        };
      })
    );

    res.json({
      subscription: {
        amount: subscription.amount,
        active: subscription.active,
        createdAt: subscription.createdAt,
      },
      totalDonations: donationHistory.length,
      totalAmount: donationHistory.reduce((sum, d) => sum + d.amount, 0),
      donations: populatedHistory,
    });
  } catch (err) {
    console.error("Error fetching subscription donations:", err);
    res.status(500).json({ message: "Failed to fetch donation history" });
  }
}
