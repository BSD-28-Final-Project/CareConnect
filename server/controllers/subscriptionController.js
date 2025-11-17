import { getUsersCollection } from "../models/userModel.js";
import { getSubscriptionCollection } from "../models/subscriptionModel.js";
import { getActivityCollection } from "../models/activityModel.js";
import Xendit from "xendit-node";

const x = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });
const { PaymentMethod, Recurring } = x;

// 2. ADD PAYMENT METHOD
export async function addPaymentMethod(req, res) {
  try {
    const users = await getUsersCollection();

    const paymentMethod = await PaymentMethod.create({
      type: req.body.type,
      tokenId: req.body.tokenId
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

    const users = await getUsersCollection();
    const subs = await getSubscriptionCollection();
    const activities = await getActivityCollection();

    const user = await users.findOne({ _id: req.user.id });
    if (!user.paymentMethodId) {
      return res.status(400).json({ message: "Payment method required" });
    }

    const targetActivity = await activities.findOne({}, { sort: { collectedMoney: 1 } });

    const recurring = await Recurring.create({
      paymentMethodId: user.paymentMethodId,
      amount,
      interval: "MONTH",
      intervalCount: 1
    });

    await subs.insertOne({
      userId: req.user.id,
      subscriptionId: recurring.id,
      amount,
      active: true,
      activityId: targetActivity._id,
      createdAt: new Date()
    });

    res.status(201).json({
      message: "Subscription created",
      amount,
      activityId: targetActivity._id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to subscribe" });
  }
}

// 4. GET SUBSCRIPTION DETAILS
export async function getSubscriptionDetails(req, res) {
  try {
    const subs = await getSubscriptionCollection();

    const data = await subs.findOne({ userId: req.user.id, active: true });

    res.json(data || {});
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch details" });
  }
}

// 5. UPDATE AMOUNT
export async function updateSubscriptionAmount(req, res) {
  try {
    const { newAmount } = req.body;
    const subs = await getSubscriptionCollection();

    const current = await subs.findOne({ userId: req.user.id, active: true });

    await Recurring.update(current.subscriptionId, {
      amount: newAmount
    });

    await subs.updateOne(
      { userId: req.user.id },
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

    const current = await subs.findOne({ userId: req.user.id, active: true });

    await Recurring.disable(current.subscriptionId);

    await subs.updateOne(
      { userId: req.user.id },
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
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Failed to load history" });
  }
}