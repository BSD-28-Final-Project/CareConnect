import { getNewsCollection } from "../models/newsModel.js";
import { getActivityCollection } from "../models/activityModel.js";
import { ObjectId } from "mongodb";

/**
 * CREATE NEWS
 * Add news/update for an activity
 */
export const createNews = async (req, res, next) => {
  try {
    const { activityId, title, content, images } = req.body;

    // Validation
    if (!activityId || !title || !content) {
      return res.status(400).json({ 
        message: "activityId, title, and content are required" 
      });
    }

    if (!ObjectId.isValid(activityId)) {
      return res.status(400).json({ message: "Invalid activityId format" });
    }

    // Check if activity exists
    const activityCollection = await getActivityCollection();
    const activity = await activityCollection.findOne({ 
      _id: new ObjectId(activityId) 
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const collection = await getNewsCollection();

    const news = {
      activityId: new ObjectId(activityId),
      title: title.trim(),
      content: content.trim(),
      images: Array.isArray(images) ? images : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(news);
    const insertedNews = await collection.findOne({ _id: result.insertedId });

    res.status(201).json({ 
      message: "News created successfully",
      data: insertedNews
    });
  } catch (error) {
    console.error("Error creating news:", error);
    next(error);
  }
};

/**
 * GET ALL NEWS
 * Optional filter by activityId
 */
export const getAllNews = async (req, res, next) => {
  try {
    const { activityId } = req.query;
    const collection = await getNewsCollection();

    const filter = {};
    if (activityId) {
      if (!ObjectId.isValid(activityId)) {
        return res.status(400).json({ message: "Invalid activityId format" });
      }
      filter.activityId = new ObjectId(activityId);
    }

    const news = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ 
      data: news,
      total: news.length
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    next(error);
  }
};

/**
 * GET NEWS BY ACTIVITY ID
 * Get all news/updates for specific activity
 */
export const getNewsByActivity = async (req, res, next) => {
  try {
    const { activityId } = req.params;

    if (!ObjectId.isValid(activityId)) {
      return res.status(400).json({ message: "Invalid activityId format" });
    }

    const collection = await getNewsCollection();
    const news = await collection
      .find({ activityId: new ObjectId(activityId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ 
      data: news,
      total: news.length
    });
  } catch (error) {
    console.error("Error fetching news by activity:", error);
    next(error);
  }
};

/**
 * GET LATEST NEWS
 * Get most recent news across all activities
 */
export const getLatestNews = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const collection = await getNewsCollection();

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({ message: "Invalid limit parameter" });
    }

    const news = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .toArray();

    res.status(200).json({ 
      data: news,
      total: news.length
    });
  } catch (error) {
    console.error("Error fetching latest news:", error);
    next(error);
  }
};

/**
 * GET NEWS BY ID
 */
export const getNewsById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid news ID format" });
    }

    const collection = await getNewsCollection();
    const news = await collection.findOne({ _id: new ObjectId(id) });

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(200).json({ data: news });
  } catch (error) {
    console.error("Error fetching news:", error);
    next(error);
  }
};

/**
 * UPDATE NEWS
 */
export const updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, images } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid news ID format" });
    }

    const updateData = { updatedAt: new Date() };

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ message: "Title must be a non-empty string" });
      }
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      if (typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ message: "Content must be a non-empty string" });
      }
      updateData.content = content.trim();
    }

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({ message: "Images must be an array" });
      }
      updateData.images = images;
    }

    const collection = await getNewsCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(200).json({ 
      message: "News updated successfully",
      data: result
    });
  } catch (error) {
    console.error("Error updating news:", error);
    next(error);
  }
};

/**
 * DELETE NEWS
 */
export const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid news ID format" });
    }

    const collection = await getNewsCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    console.error("Error deleting news:", error);
    next(error);
  }
};
