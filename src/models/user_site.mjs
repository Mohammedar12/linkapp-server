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

const ThemeSchema = new Schema(
  {
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
    isReadyTheme: {
      type: Boolean,
    },
    linkStyle: {
      isGradient: {
        type: Boolean,
      },
      bgColor: {
        type: String,
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
    },
    headerStyle: {
      isGradient: {
        type: Boolean,
      },
      bgColor: {
        type: String,
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
    },
    bgImage: ImageSchema,
    themeName: {
      type: String,
    },
  },
  { _id: false }
);

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
    theme: { type: ThemeSchema, required: true },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
      required: true,
    },
    experience: {
      type: Number,
    },
    location: {
      type: String,
    },
    about: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    reports: {
      type: Schema.Types.ObjectId,
      ref: "Reports",
    },
    avatar: ImageSchema,
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    isActive: {
      type: Boolean,
      default: false,
      required: true,
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
