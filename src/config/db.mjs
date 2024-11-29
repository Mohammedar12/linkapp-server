import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/a";

const dbConnect = async () => {
  try {
    console.log(`Attempting to connect to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(
      "mongodb://ali:123@mongodb:27017/linkapp?authSource=admin"
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Optionally, exit the process if DB connection fails
    process.exit(1);
  }
};

export default dbConnect;
