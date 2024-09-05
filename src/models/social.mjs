import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SocialSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  url: {
    type: String,
  },
  display: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Social = mongoose.model("Social", SocialSchema);
