import mongoose from "mongoose";
import { format } from "date-fns";

const Schema = mongoose.Schema;

const SiteReportsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    slug: { type: String, required: true, index: true },
    visits: {
      totalVisits: { type: Number, default: 0 },
      daily: [
        {
          date: { type: String },
          visits: { type: Number, default: 0 },
          device: {
            type: Map,
            of: Number,
            default: () => new Map(),
          },
        },
      ],
      monthly: [
        {
          month: { type: String },
          visits: { type: Number, default: 0 },
          device: {
            type: Map,
            of: Number,
            default: () => new Map(),
          },
        },
      ],
    },

    analytics: {
      devices: {
        type: Map,
        of: Number,
        default: () => new Map(),
      },
      platform: {
        type: Map,
        of: Number,
        default: () => new Map(),
      },
      os: {
        type: Map,
        of: Number,
        default: () => new Map(),
      },
      browser: {
        type: Map,
        of: Number,
        default: () => new Map(),
      },
      location: [
        {
          country: { type: String, default: "Unknown" },
          region: { type: String, default: "Unknown" },
          city: { type: String, default: "Unknown" },
          timezone: { type: String, default: "Unknown" },
          visits: { type: Number, default: 0 },
        },
      ],
    },
    activeSessions: [
      {
        sessionId: { type: String, required: true },
        lastVisit: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

function safeIncrement(map, key) {
  if (!key || key === "undefined" || key === "null") {
    key = "Unknown";
  }

  const currentValue = map.get(key);
  const newValue =
    (currentValue && !isNaN(currentValue) ? currentValue : 0) + 1;

  map.set(key, newValue);

  return map;
}

SiteReportsSchema.methods.incrementAnalytics = async function (data) {
  // clean up expired sessions first
  this.activeSessions = this.activeSessions.filter(
    (session) => session.expiresAt > new Date()
  );

  // Check if this session already exists and update lastVisit
  const sessionIndex = this.activeSessions.find(
    (session) => session.sessionId === data.sessionId
  );

  //  If session does exist update lastVisit
  if (!sessionIndex) {
    sessionIndex.lastVisit = new Date();
    sessionIndex.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  } else {
    // If session does not exist add new session to activeSessions and increment analytics
    this.activeSessions.push({
      sessionId: data.sessionId,
      lastVisit: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 30 minutes
    });

    // Increment device count
    const device = this.analytics.devices || new Map();

    this.analytics.devices = safeIncrement(device, data.device);

    // Increment platform count

    const platform = this.analytics.platform || new Map();

    this.analytics.platform = safeIncrement(platform, data.platform);

    // Increment OS count

    const operatingSystems = this.analytics.operatingSystems || new Map();

    this.analytics.os = safeIncrement(operatingSystems, data.os);

    // Increment browser count
    const browser = this.analytics.browser || new Map();

    this.analytics.browser = safeIncrement(browser, data.browser);

    // Increment location count
    const location = this.analytics.location.findIndex(
      (loc) =>
        loc.country === data.location.country &&
        loc.region === data.location.region &&
        loc.city === data.location.city
    );

    if (location >= 0) {
      this.analytics.location[location].visits += 1;
    } else {
      this.analytics.location.push({
        ...data.location,
        visits: 1,
      });
    }

    // Increment total visits
    this.visits.totalVisits += 1;

    // Increment daily and monthly visits

    const today = format(new Date().setHours(0, 0, 0, 0), "yyyy-MM-dd");

    const dailyVisitIndex = this.visits.daily.findIndex(
      (visit) => visit.date === today
    );

    console.log(dailyVisitIndex);

    if (dailyVisitIndex >= 0) {
      const device = this.visits.daily[dailyVisitIndex].device || new Map();

      this.visits.daily[dailyVisitIndex].visits += 1;
      this.visits.daily[dailyVisitIndex].device = safeIncrement(
        device,
        data.device
      );
    } else {
      this.visits.daily.push({
        date: today,
        visits: 1,
      });
    }

    // Increment monthly visits
    const thisMonth = format(new Date().setHours(0, 0, 0, 0), "yyyy-MM");

    const monthlyVisitsIndex = this.visits.monthly.findIndex(
      (visit) => visit.month === thisMonth // Compare timestamps
    );

    if (monthlyVisitsIndex >= 0) {
      const device =
        this.visits.monthly[monthlyVisitsIndex].device || new Map();
      this.visits.monthly[monthlyVisitsIndex].visits += 1;
      this.visits.monthly[monthlyVisitsIndex].device = safeIncrement(
        device,
        data.device
      );
    } else {
      this.visits.monthly.push({
        month: thisMonth,
        visits: 1,
      });
    }
  }

  await this.save();
};

export const SiteReports = mongoose.model("Reports", SiteReportsSchema);
