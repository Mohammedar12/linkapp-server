const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const HeaderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  header: {
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
});

module.exports = mongoose.model("Header", HeaderSchema);
