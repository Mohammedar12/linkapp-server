const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSiteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  sitename: {
    type: String,
    unique: true,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  links: [
    {
      link: {
        type: String,
      },
    },
  ],
  thame: {
    type: String,
  },
  about: {
    type: String,
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

module.exports = mongoose.model("UserSite", UserSiteSchema);
