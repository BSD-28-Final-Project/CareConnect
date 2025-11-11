import { getNewsCollection } from "../models/newsModel.js";
import { ObjectId } from "mongodb";

export const createNews = async (req, res) => {
  try {
    const { activityId, title, content, images } = req.body;
    const collection = await getNewsCollection();

    const news = {
      activityId: new ObjectId(activityId),
      title,
      content,
      images,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(news);
    res.status(201).json({ message: "News added" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add news", error });
  }
};

export const getNewsByActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const collection = await getNewsCollection();
    const newsList = await collection.find({ activityId: new ObjectId(activityId) }).toArray();
    res.json(newsList);
  } catch (err) {
    res.status(500).json({ message: "Error fetching news", err });
  }
};
