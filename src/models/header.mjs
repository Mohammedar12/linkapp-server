import mongoose from "mongoose";

const Schema = mongoose.Schema;

const HeaderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  title: {
    type: String,
  },
  display: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  index: {
    type: Number,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Header = mongoose.model("Header", HeaderSchema);
