import { connectDB } from "../config/database.js";
import { activitySeeds } from "./activitySeeds.js";

async function seedActivities() {
  try {
    console.log("🌱 Starting activity seeding...");
    
    const db = await connectDB();
    const collection = db.collection("activities");
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing activities`);
    
    // Insert seed data
    const result = await collection.insertMany(activitySeeds);
    console.log(`✅ Successfully seeded ${result.insertedCount} activities`);
    
    // Display summary
    const categories = await collection.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log("\n📊 Seeded activities by category:");
    categories.forEach(cat => {
      console.log(`   - ${cat._id}: ${cat.count} activities`);
    });
    
    console.log("\n🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding activities:", error);
    process.exit(1);
  }
}

seedActivities();
