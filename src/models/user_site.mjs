import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SocialSchema = new Schema(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
    username: { type: String, required: true },
    icon: { type: String },
  },
  { _id: false }
);

const ImageSchema = new Schema(
  {
    public_id: String,
    url: String,
  },
  { _id: false }
);

// const MixedItemSchema = new Schema(
//   {
//     itemType: {
//       type: String,
//       enum: ["Links", "Header"],
//       required: true,
//     },
//     item: {
//       type: Schema.Types.ObjectId,
//       refPath: "itemType",
//       required: true,
//     },
//     index: {
//       type: Number,
//       min: 0,
//     },
//     id: {
//       type: String,
//       unique: true,
//       sparse: true,
//     },
//   },
//   { _id: false }
// );

const UserSiteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    // items: {
    //   type: [MixedItemSchema],
    //   // validate: [arrayLimit, "{PATH} exceeds the limit of 50"],
    // },
    links: [{ type: mongoose.Schema.Types.ObjectId, ref: "Links" }],
    headers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Header",
      },
    ],
    social: {
      type: [SocialSchema],
      // validate: [arrayLimit, "{PATH} exceeds the limit of 10"],
    },
    skills: {
      type: [String],
      validate: [arrayLimit, "{PATH} exceeds the limit of 20"],
    },
    theme: {
      isGradient: {
        type: Boolean,
      },
      gradient: {
        from: {
          type: String,
        },
        to: {
          type: String,
        },
        dir: {
          type: String,
        },
      },
      bgColor: {
        type: String,
      },
      AvatarBgColor: {
        type: String,
      },
      isParticles: {
        type: Boolean,
      },
      linksBgColor: {
        type: String,
      },
      HeadersBgColor: {
        type: String,
      },
      linksBgStyle: {
        type: String,
      },
      HeadersBgStyle: {
        type: String,
      },
      bgImage: ImageSchema,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    experience: {
      type: Number,
    },
    location: {
      type: Number,
    },

    about: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    avatar: ImageSchema,
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "moderator"],
    },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length <= 3;
}

UserSiteSchema.index({ user: 1, slug: 1 }, { unique: true });

export const UserSite = mongoose.model("UserSite", UserSiteSchema);
