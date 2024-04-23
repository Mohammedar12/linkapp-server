const mongoose = require("mongoose");

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
  type: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Links", LinksSchema);
