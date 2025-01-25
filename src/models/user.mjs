import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  authId: {
    type: String,
  },
  authType: { type: String, enum: ["local", "google"], required: true },
  hash: {
    type: String,
  },
  salt: {
    type: String,
  },
  tokenExpiration: {
    type: Date,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  registerSteps: {
    type: Boolean,
    default: false,
    required: true,
  },
  verifyToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  role: {
    type: String,

    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model("User", UserSchema);
