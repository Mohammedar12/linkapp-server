import { UserSite } from "../models/user_site.mjs";
import { User } from "../models/user.mjs";
import { SiteReports } from "../models/reports.mjs";
import { Links } from "../models/links.mjs";
import { Header } from "../models/header.mjs";
import { tryCatch } from "../utils/tryCatch.mjs";
import { upload } from "../utils/cloudinary.mjs";
import geoip from "geoip-lite";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { startOfMonth, endOfMonth, format } from "date-fns";
import fs from "fs";
import "dotenv/config";
import mongoose from "mongoose";

import _ from "lodash";

const SiteReportsController = {
  addReports: tryCatch(async (req, res) => {
    const userAgent = req.useragent;
    const clientIp = req.clientIp;
    // Get location from IP

    const geo = geoip.lookup(clientIp);

    try {
      const { slug } = req.body;

      const siteReports = await SiteReports.findOne({ slug: slug });
      const userSite = await UserSite.findOne({ slug: slug });

      const sessionId =
        req.cookies.sessionId || crypto.randomBytes(32).toString("hex"); // Get sessionId from cookies
      const isAdmin = req.cookies.jwt ? true : false; //  Check if user is admin

      const userDeviceInfo = {
        // Device information

        sessionId: sessionId,
        device: userAgent.isDesktop ? "Desktop" : "Mobile" || "Unknown",
        platform: userAgent.platform || "Unknown",
        os: userAgent.isWindows ? "Windows" : userAgent.os || "Unknown",
        browser: userAgent.browser || "Unknown",
        location: {
          country: geo?.country || "Unknown",
          region: geo?.region || "Unknown",
          city: geo?.city || "Unknown",
          timezone: geo?.timezone || "Unknown",
        },
      };

      // Check if user is admin and prevent reporting
      if (isAdmin) {
        return res.status(203).json({ message: "Admins can't report" });
      }

      if (!siteReports) {
        // Create new report if it doesn't exist
        const newReport = await SiteReports.create({
          user: userSite?.user,
          slug: slug,
          // assuming you have user info in request
        });
        await newReport.incrementAnalytics(userDeviceInfo);

        if (!req.cookies.sessionId) {
          res.cookie("sessionId", sessionId, {
            maxAge: 30 * 60 * 1000, // 30 minutes
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          });
        }
        return res.status(201).json(newReport);
      }
      // Update existing report
      await siteReports.incrementAnalytics(userDeviceInfo);

      if (!req.cookies.sessionId) {
        res.cookie("sessionId", sessionId, {
          maxAge: 30 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
      }

      return res.status(200).json(siteReports);
    } catch (error) {
      console.error("Error in index function:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }),
  getReports: tryCatch(async (req, res) => {
    try {
      const id = req.cookies.id;

      const reports = await SiteReports.findOne({ user: id });

      if (!reports) {
        return res.json({
          isActive: false,
          message: "Sorry No Report Exist",
        });
      }

      res.json(reports);
    } catch (error) {
      console.error("Error in index function:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }),
};
export default SiteReportsController;
