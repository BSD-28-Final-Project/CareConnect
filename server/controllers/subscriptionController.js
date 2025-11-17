import { getSubscriptionCollection } from "../models/subscriptionModel.js";
import { getActivityCollection } from "../models/activityModel.js";
import { getUserCollection } from "../models/userModel.js";
import { getDonationCollection } from "../models/donationModel.js";
import { ObjectId } from "mongodb";
import { createRequire } from 'module';

// Import Xendit using CommonJS require
const require = createRequire(import.meta.url);
const { Xendit } = require('xendit-node');

// Initialize Xendit
const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

// 2. ADD PAYMENT METHOD
export async function addPaymentMethod(req, res) {
  try {
    const users = await getUserCollection();

    const paymentMethod = await xendit.PaymentMethod.create({
      type: req.body.type,      // e.g. CARD
      tokenId: req.body.tokenId // token dari frontend
    });

    await users.updateOne(
      { _id: req.user.id },
      { $set: { paymentMethodId: paymentMethod.id } }
    );

    res.json({
      message: "Payment method added",
      paymentMethodId: paymentMethod.id
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add payment method" });
  }
}

// 3. CREATE SUBSCRIPTION
export async function createSubscription(req, res) {
  try {
    const { amount } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const users = await getUserCollection();
    const subs = await getSubscriptionCollection();
    const activities = await getActivityCollection();

    const user = await users.findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.paymentMethodId) {
      return res.status(400).json({ message: "Payment method required. Please add a payment method first." });
    }

    // Find activity with LOWEST collected money
    const targetActivity = await activities.findOne(
      {},
      { sort: { collectedMoney: 1 } } // 1 = ascending, jadi yang paling rendah duluan
    );

    if (!targetActivity) {
      return res.status(404).json({ message: "No activity available for subscription" });
    }

    // Create Xendit recurring payment
    const newRecurring = await xendit.RecurringPayment.create({
      paymentMethodId: user.paymentMethodId,
      amount,
      interval: "MONTH",
      intervalCount: 1,
      description: `CareConnect Monthly Donation to ${targetActivity.title}`
    });

    // Save subscription to database
    await subs.insertOne({
      userId: new ObjectId(req.user.id),
      subscriptionId: newRecurring.id,
      amount,
      active: true,
      targetActivityId: targetActivity._id, // Activity target saat subscription dibuat
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      message: "Subscription created successfully",
      amount,
      targetActivity: {
        id: targetActivity._id,
        title: targetActivity.title,
        collectedMoney: targetActivity.collectedMoney
      },
      subscriptionId: newRecurring.id,
      nextChargeDate: newRecurring.nextChargeDate
    });

  } catch (err) {
    console.error("Error creating subscription:", err);
    res.status(500).json({ message: "Failed to create subscription", error: err.message });
  }
}

// 4. GET SUBSCRIPTION DETAILS
export async function getSubscriptionDetails(req, res) {
  try {
    const subs = await getSubscriptionCollection();
    const data = await subs.findOne({ 
      userId: new ObjectId(req.user.id), 
      active: true 
    });
    res.json(data || {});
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch details" });
  }
}

// 5. UPDATE SUBSCRIPTION AMOUNT
export async function updateSubscriptionAmount(req, res) {
  try {
    const { newAmount } = req.body;
    const subs = await getSubscriptionCollection();

    const current = await subs.findOne({ 
      userId: new ObjectId(req.user.id), 
      active: true 
    });

    await xendit.RecurringPayment.update(current.subscriptionId, {
      amount: newAmount
    });

    await subs.updateOne(
      { userId: new ObjectId(req.user.id) },
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
    const subs = await getSubscriptionCollection();
    const current = await subs.findOne({ 
      userId: new ObjectId(req.user.id), 
      active: true 
    });

    await xendit.RecurringPayment.disable(current.subscriptionId);

    await subs.updateOne(
      { userId: new ObjectId(req.user.id) },
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
    const subs = await getSubscriptionCollection();

    const list = await subs
      .find({ userId: new ObjectId(req.user.id) })
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
    
    console.log("Received recurring payment webhook:", JSON.stringify(webhookData, null, 2));

    // Verify webhook is for successful payment
    if (webhookData.status !== "SUCCEEDED" && webhookData.event !== "recurring_payment.succeeded") {
      return res.status(200).json({ message: "Webhook received but not a successful payment" });
    }

    const subs = await getSubscriptionCollection();
    const activities = await getActivityCollection();
    const donations = await getDonationCollection();

    // Find subscription by Xendit subscription ID
    const subscription = await subs.findOne({ 
      subscriptionId: webhookData.subscription_id || webhookData.recurring_payment_id,
      active: true 
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
      updatedAt: new Date()
    };

    await donations.insertOne(newDonation);

    // Update activity's collected money
    await activities.updateOne(
      { _id: targetActivity._id },
      {
        $inc: { collectedMoney: amount },
        $set: { updatedAt: new Date() }
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
          updatedAt: new Date()
        }
      }
    );

    console.log(`✅ Subscription payment distributed: ${amount} IDR to activity ${targetActivity.title}`);

    res.status(200).json({ 
      message: "Webhook processed successfully",
      donationAmount: amount,
      targetActivity: {
        id: targetActivity._id,
        title: targetActivity.title,
        collectedMoney: targetActivity.collectedMoney + amount
      }
    });

  } catch (err) {
    console.error("Error processing recurring webhook:", err);
    res.status(500).json({ message: "Failed to process webhook", error: err.message });
  }
}

// 9. GET SUBSCRIPTION DONATIONS HISTORY
export async function getSubscriptionDonations(req, res) {
  try {
    const subs = await getSubscriptionCollection();
    const donations = await getDonationCollection();

    // Find active subscription
    const subscription = await subs.findOne({ 
      userId: new ObjectId(req.user.id),
      active: true 
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
          activity: activity ? {
            id: activity._id,
            title: activity.title,
            category: activity.category
          } : null
        };
      })
    );

    res.json({
      subscription: {
        amount: subscription.amount,
        active: subscription.active,
        createdAt: subscription.createdAt
      },
      totalDonations: donationHistory.length,
      totalAmount: donationHistory.reduce((sum, d) => sum + d.amount, 0),
      donations: populatedHistory
    });

  } catch (err) {
    console.error("Error fetching subscription donations:", err);
    res.status(500).json({ message: "Failed to fetch donation history" });
  }
}
