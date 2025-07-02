import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const isDevelopment = process.env.NODE_ENV === "production";

const MONGODB_URI = isDevelopment
  ? process.env.MONGODB_URI
  : "mongodb://ali:123@localhost:27017/linkapp?authSource=admin";

const dbConnect = async () => {
  try {
    console.log(`Attempting to connect to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Optionally, exit the processs if DB connection fails
    process.exit(1);
  }
};

export default dbConnect;
