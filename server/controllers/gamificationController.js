import { ObjectId } from "mongodb";
import { getUserCollection } from "../models/userModel.js";
import { 
  POINT_RULES, 
  LEVELS, 
  ACHIEVEMENTS, 
  getUserLevel,
  calculateDonationPoints 
} from "../config/gamification.js";

/**
 * GET USER GAMIFICATION PROFILE
 * GET /api/gamification/profile/:userId
 */
export const getUserGamificationProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const collection = await getUserCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentLevel = getUserLevel(user.point || 0);
    const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
    
    const pointsToNextLevel = nextLevel 
      ? nextLevel.minPoints - (user.point || 0)
      : 0;

    const progress = nextLevel 
      ? ((user.point - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints) * 100).toFixed(2)
      : 100;

    const profile = {
      userId: user._id,
      name: user.name,
      totalPoints: user.point || 0,
      currentLevel: currentLevel,
      nextLevel: nextLevel || null,
      pointsToNextLevel,
      progress: progress + '%',
      stats: {
        totalDonations: user.totalDonations || 0,
        totalVolunteerActivities: user.totalVolunteerActivities || 0,
        achievementsUnlocked: user.achievements?.length || 0,
      },
      achievements: user.achievements || [],
      recentActivity: (user.activityLog || []).slice(-10).reverse(),
    };

    res.status(200).json({ data: profile });
  } catch (error) {
    console.error("Error getting gamification profile:", error);
    res.status(500).json({ 
      message: "Error getting gamification profile",
      error: error.message 
    });
  }
};

/**
 * GET LEADERBOARD
 * GET /api/gamification/leaderboard?type=points&limit=100
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 100, type = "points" } = req.query;
    const collection = await getUserCollection();

    let sortField;
    switch (type) {
      case "donations":
        sortField = { totalDonations: -1 };
        break;
      case "volunteers":
        sortField = { totalVolunteerActivities: -1 };
        break;
      case "points":
      default:
        sortField = { point: -1 };
        break;
    }

    const users = await collection
      .find({})
      .project({ password: 0 })
      .sort(sortField)
      .limit(parseInt(limit))
      .toArray();

    const leaderboard = users.map((user, index) => {
      const level = getUserLevel(user.point || 0);
      return {
        rank: index + 1,
        userId: user._id,
        name: user.name,
        points: user.point || 0,
        level: level,
        totalDonations: user.totalDonations || 0,
        totalVolunteerActivities: user.totalVolunteerActivities || 0,
        achievementsCount: user.achievements?.length || 0,
      };
    });

    res.status(200).json({ 
      data: leaderboard,
      count: leaderboard.length 
    });
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({ 
      message: "Error getting leaderboard",
      error: error.message 
    });
  }
};

/**
 * GET ALL ACHIEVEMENTS (for display)
 * GET /api/gamification/achievements
 */
export const getAllAchievements = async (req, res) => {
  try {
    const achievementsList = Object.values(ACHIEVEMENTS);
    res.status(200).json({ 
      data: achievementsList,
      count: achievementsList.length 
    });
  } catch (error) {
    console.error("Error getting achievements:", error);
    res.status(500).json({ 
      message: "Error getting achievements",
      error: error.message 
    });
  }
};

/**
 * GET USER ACHIEVEMENTS STATUS
 * GET /api/gamification/achievements/:userId
 */
export const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const collection = await getUserCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allAchievements = Object.values(ACHIEVEMENTS);
    const userAchievementIds = (user.achievements || []).map(a => a.id);

    const achievementsStatus = allAchievements.map(achievement => ({
      ...achievement,
      unlocked: userAchievementIds.includes(achievement.id),
      unlockedAt: user.achievements?.find(a => a.id === achievement.id)?.unlockedAt || null,
    }));

    res.status(200).json({ 
      data: achievementsStatus,
      unlockedCount: userAchievementIds.length,
      totalCount: allAchievements.length,
    });
  } catch (error) {
    console.error("Error getting user achievements:", error);
    res.status(500).json({ 
      message: "Error getting user achievements",
      error: error.message 
    });
  }
};

/**
 * INTERNAL HELPER: Add points to user
 */
export const addUserPoints = async (userId, points, reason, metadata = {}) => {
  try {
    if (!ObjectId.isValid(userId)) return null;

    const collection = await getUserCollection();
    
    const activityEntry = {
      points,
      reason,
      metadata,
      timestamp: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $inc: { point: points },
        $push: { activityLog: activityEntry },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Error adding user points:", error);
    return null;
  }
};

/**
 * INTERNAL HELPER: Add achievement to user
 */
export const addUserAchievement = async (userId, achievementId, achievementData) => {
  try {
    if (!ObjectId.isValid(userId)) return null;

    const collection = await getUserCollection();

    const achievement = {
      id: achievementId,
      ...achievementData,
      unlockedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(userId),
        "achievements.id": { $ne: achievementId }
      },
      {
        $push: { achievements: achievement },
        $inc: { point: achievementData.points },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    if (result) {
      console.log(`🏆 User ${userId} unlocked achievement: ${achievementData.name}`);
    }

    return result;
  } catch (error) {
    console.error("Error adding user achievement:", error);
    return null;
  }
};

/**
 * PROCESS DONATION POINTS
 * Called from donationController after successful payment
 */
export const processDonationPoints = async (userId, amount) => {
  try {
    if (!ObjectId.isValid(userId)) return;

    const collection = await getUserCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) return;

    // Calculate and add points
    const points = calculateDonationPoints(amount);
    await addUserPoints(userId, points, "donation", { amount, points });

    // Update donation stats
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: { totalDonations: amount },
        $set: { updatedAt: new Date() },
      }
    );

    // Get updated user for achievement checks
    const updatedUser = await collection.findOne({ _id: new ObjectId(userId) });

    // Check achievements
    // First donation
    if (!updatedUser.achievements?.find(a => a.id === "first_donation") && 
        updatedUser.totalDonations === amount) {
      await addUserAchievement(userId, ACHIEVEMENTS.FIRST_DONATION.id, ACHIEVEMENTS.FIRST_DONATION);
    }

    // Generous donor (1M)
    if (!updatedUser.achievements?.find(a => a.id === "generous_donor") && 
        updatedUser.totalDonations >= 1000000) {
      await addUserAchievement(userId, ACHIEVEMENTS.GENEROUS_DONOR.id, ACHIEVEMENTS.GENEROUS_DONOR);
    }

    // Super donor (5M)
    if (!updatedUser.achievements?.find(a => a.id === "super_donor") && 
        updatedUser.totalDonations >= 5000000) {
      await addUserAchievement(userId, ACHIEVEMENTS.SUPER_DONOR.id, ACHIEVEMENTS.SUPER_DONOR);
    }

    console.log(`✅ User ${userId} earned ${points} points from donation Rp ${amount.toLocaleString()}`);
  } catch (error) {
    console.error("Error processing donation points:", error);
  }
};

/**
 * PROCESS VOLUNTEER POINTS
 * Called from activityController after volunteer registration
 */
export const processVolunteerPoints = async (userId) => {
  try {
    if (!ObjectId.isValid(userId)) return;

    const collection = await getUserCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) return;

    // Add points
    const points = POINT_RULES.VOLUNTEER_REGISTER;
    await addUserPoints(userId, points, "volunteer_register", { points });

    // Update volunteer stats
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: { totalVolunteerActivities: 1 },
        $set: { updatedAt: new Date() },
      }
    );

    // Get updated user for achievement checks
    const updatedUser = await collection.findOne({ _id: new ObjectId(userId) });

    // Check achievements
    // First volunteer
    if (!updatedUser.achievements?.find(a => a.id === "first_volunteer") && 
        updatedUser.totalVolunteerActivities === 1) {
      await addUserAchievement(userId, ACHIEVEMENTS.FIRST_VOLUNTEER.id, ACHIEVEMENTS.FIRST_VOLUNTEER);
    }

    // Active volunteer (5 activities)
    if (!updatedUser.achievements?.find(a => a.id === "active_volunteer") && 
        updatedUser.totalVolunteerActivities >= 5) {
      await addUserAchievement(userId, ACHIEVEMENTS.ACTIVE_VOLUNTEER.id, ACHIEVEMENTS.ACTIVE_VOLUNTEER);
    }

    console.log(`✅ User ${userId} earned ${points} points from volunteering`);
  } catch (error) {
    console.error("Error processing volunteer points:", error);
  }
};
