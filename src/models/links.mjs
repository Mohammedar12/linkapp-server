import mongoose from "mongoose";

const Schema = mongoose.Schema;

const LinksSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  title: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  display: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
  },
  index: {
    type: Number,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Links = mongoose.model("Links", LinksSchema);
