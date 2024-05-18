import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const dbConnect = () => {
  mongoose.connect(process.env.DB_URL);
};

export default dbConnect;
