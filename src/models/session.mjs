import mongoose from "mongoose";
const Schema = mongoose.Schema;

const sessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    sessionId: {
      type: String,
      unique: true,
    },
    expireAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model("sessions", sessionSchema);
