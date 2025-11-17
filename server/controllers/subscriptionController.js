import { getActivityCollection } from "../models/activityModel.js";
import { getUserCollection } from "../models/userModel.js";

export const subscribe = async (req, res, next) => {
    try {
        const userId = req.user.id;  // dari JWT
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Amount must be > 0" });
        }

        const activityCollection = await getActivityCollection();
        const userCollection = await getUserCollection();

        // 1. serach activity with lowest collectedMoney
        const targetActivity = await activityCollection
            .find()
            .sort({ collectedMoney: 1 })
            .limit(1)
            .toArray();

        if (!targetActivity.length) {
            return res.status(404).json({ message: "No activities found" });
        }

        const activity = targetActivity[0];

        // 2. Add to collectedMoney
        await activityCollection.updateOne(
            { _id: activity._id },
            {
                $set: { updatedAt: new Date() },
                $inc: { collectedMoney: amount }
            }
        );

        // 3. Save subscription history for user (optional)
        await userCollection.updateOne(
            { _id: activity._id },
            {
                $set: { updatedAt: new Date() },
                $push: {
                    subscriptionHistory: {
                        amount,
                        activityId: activity._id,
                        date: new Date()
                    }
                }
            }
        );

        res.json({
            userId,
            message: "Subscription processed successfully",
            distributedTo: activity.title,
            activityId: activity._id,
            amount
        });
    } catch (err) {
        next(err);
    }
};
