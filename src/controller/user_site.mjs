import { UserSite } from "../models/user_site.mjs";
import { User } from "../models/user.mjs";
import { Links } from "../models/links.mjs";
import { Header } from "../models/header.mjs";
import { tryCatch } from "../utils/tryCatch.mjs";
import { upload } from "../utils/cloudinary.mjs";
import { ObjectId } from "mongodb";
import fs from "fs";
import "dotenv/config";
import mongoose from "mongoose";

import _ from "lodash";

const handleFileUpload = async (file, dir) => {
  if (!file) return null;

  try {
    const { path } = file;
    console.log("path", path);
    const uploadedFile = await upload(path, `app/${dir}`);

    await fs.unlinkSync(path);

    return uploadedFile;
  } catch (error) {
    console.error("Error handling file upload:", error);
    throw error;
  }
};

const UserSiteController = {
  index: tryCatch(async (req, res) => {
    try {
      const slug = req.params.slug;

      const site = await UserSite.findOne({ slug }).populate({
        path: "links",
        match: { display: true },
      });

      if (!site) {
        return res.json({
          isActive: false,
          message: "Sorry This Site Not Exist",
        });
      }

      if (!site.isActive) {
        return res.json({
          isActive: site.isActive,
          message: "the site not active yet",
        });
      }

      res.json(site);
    } catch (error) {
      console.error("Error in index function:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }),
  id: tryCatch(async (req, res) => {
    const id = req.cookies["id"];
    const jwt = req.cookies["authenticated"];
    const site = await UserSite.findOne({ user: id }).populate("links");

    if (jwt) {
      console.log(jwt, "i'm jwt");
    }
    if (!site) {
      res.status(404).json({ error: "The site not exist" });
      // throw new Error("The site not exist yet");
    }

    res.json(site);
  }),
  create: tryCatch(async (req, res) => {
    const { social, slug, title, theme, about, skills } = req.body;
    const id = req.cookies["id"];
    const user = await User.findById({ _id: id });

    let avatar = null;

    if (req.files) {
      if (req.files.avatar) {
        avatar = await handleFileUpload(req.files.avatar[0], "avatar");
      }
    }

    const formattedSlug = slug?.replace(/\s+/g, "-").toLowerCase();
    const newSite = new UserSite({
      user: id,
      slug: formattedSlug || slug,
      social: JSON.parse(social),
      about,
      avatar,
      title,
      isActive: user.isVerified || false,
      theme: JSON.parse(theme),
      skills: JSON.parse(skills),
    });

    await User.findOneAndUpdate({ _id: id }, { username: newSite.slug });

    const site = await newSite.save();
    res.json(site);
  }),
  update: tryCatch(async (req, res) => {
    const {
      social,
      slug,
      title,
      about,
      skills,
      location,
      experience,
      isActive,
    } = req.body;
    const id = req.cookies["id"];
    const io = req.app.get("io");
    let avatar = null;
    let bgImage = null;
    let theme = null;

    // Parse theme if it exists
    if (req.body.theme) {
      try {
        theme = JSON.parse(req.body.theme);
        console.log(theme);
      } catch (e) {
        console.error("Error parsing theme:", e);
        return res.status(400).json({ message: "Invalid theme JSON" });
      }
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.avatar) {
        avatar = await handleFileUpload(req.files.avatar[0], "avatar");
      }
      if (req.files.bgImage) {
        bgImage = await handleFileUpload(req.files.bgImage[0], "backgrounds");
        if (theme) {
          theme.bgImage = bgImage;
        }
      }
    }

    // Retrieve the existing document
    const existingSite = await UserSite.findOne({ user: id });
    if (!existingSite) {
      return res.status(404).json({ message: "Site not found" });
    }

    const formattedSlug = slug?.replace(/\s+/g, "-").toLowerCase();

    // Construct the new fields object
    const newFields = {
      slug: formattedSlug || slug || existingSite.slug,
      social: social ? JSON.parse(social) : existingSite.social,
      about: about || existingSite.about,
      avatar: avatar || existingSite.avatar,
      title: title || existingSite.title,
      location: location || existingSite.location,
      isActive: isActive || existingSite.isActive,
      theme: theme || existingSite.theme,
      experience: experience || existingSite.experience,
      skills: skills ? JSON.parse(skills) : existingSite.skills,
    };

    // Use lodash to compare and only keep changed fields
    const fieldsToUpdate = _.omitBy(newFields, (value, key) => {
      return _.isEqual(value, _.get(existingSite, key));
    });

    // console.log("Fields to update:", JSON.stringify(fieldsToUpdate, null, 2));

    // If there are no fields to update, return the existing document
    if (_.isEmpty(fieldsToUpdate)) {
      return res.json(existingSite);
    }

    // Update the necessary fields
    const updatedSite = await UserSite.findOneAndUpdate(
      { user: id },
      { $set: fieldsToUpdate },
      { new: true }
    ).populate({
      path: "links",
      match: { display: true },
    });

    await User.findOneAndUpdate({ _id: id }, { username: fieldsToUpdate.slug });

    io.to(`user_${id}`).emit("site:update", {
      type: "SITE_UPDATE",
      payload: {
        siteId: updatedSite._id,
        updates: fieldsToUpdate,
        site: updatedSite,
      },
    });

    res.json(updatedSite);
  }),
  addLinks: tryCatch(async (req, res) => {
    const { url, title, type } = req.body;
    const id = req.cookies["id"];
    const io = req.app.get("io");
    const site = await UserSite.findOne({ user: id });

    // Extract domain from the url

    const extractDomain = (url) => {
      const pattern = /(?:https?:\/\/)?(?:www\.)?([^\/.:]+)/;
      const match = url.match(pattern);
      return match ? match[1] : null;
    };

    const domain = extractDomain(url);

    // Create new Link : header or url

    const newLink = await Links.create({
      user: id,
      url: type !== "Header" && url,
      title: title || domain,
      type: type,
      display: title == "" ? false : true,
    });
    // Add new Link to user site
    const userSite = await UserSite.findOneAndUpdate(
      { user: id },
      {
        $push: {
          links: newLink,
        },
      },
      { new: true, useFindAndModify: false }
    ).populate({
      path: "links",
      match: { display: true },
    });
    await newLink.save();
    await userSite.save();

    // Use ws to real-time data
    io.to(`user_${id}`).emit("site:update", {
      type: "SITE_UPDATE",
      payload: {
        siteId: id,
        updates: userSite.links,
        site: userSite,
      },
    });

    res.json(newLink);
  }),
  editLinks: tryCatch(async (req, res) => {
    const { url, title, index, display } = req.body;
    const id = req.cookies["id"];
    const io = req.app.get("io");

    const updateData = {
      url,
      title,
      index,
    };
    if (display !== undefined) {
      updateData.display = display;
    }

    const updatedLink = await Links.findOneAndUpdate(
      { _id: req.params.id },
      updateData,
      { new: true }
    );
    if (!updatedLink) {
      return res.status(404).json({ message: "Link not found" });
    }

    const site = await UserSite.findOne({ user: id }).populate({
      path: "links",
      match: { display: true },
    });

    // Use ws to real-time data
    io.to(`user_${id}`).emit("site:update", {
      type: "SITE_UPDATE",
      payload: {
        siteId: id,
        updates: site.links,
        site: site,
      },
    });

    res.json(updatedLink);
  }),
  reorder: tryCatch(async (req, res) => {
    const id = req.cookies["id"];
    const io = req.app.get("io");
    const { links } = req.body;

    console.log("Received links:", links);

    // Find the user's site
    const userSite = await UserSite.findOne({ user: id });

    if (!userSite) {
      return res
        .status(404)
        .json({ success: false, message: "User site not found" });
    }

    try {
      // Create a new array of link IDs in the correct order
      const newLinkOrder = links.map(
        (link) => new mongoose.Types.ObjectId(link.id)
      );

      // Update the userSite document
      userSite.links = newLinkOrder;

      // Save the updated userSite
      await userSite.save();

      // Fetch the updated site with populated links
      const updatedSite = await UserSite.findOne({ user: id }).populate(
        "links"
      );

      io.to(`user_${id}`).emit("site:update", {
        type: "SITE_UPDATE",
        payload: {
          reorder: newLinkOrder,
          site: updatedSite,
        },
      });
      res.json({
        success: true,
        message: "Order updated successfully",
        site: updatedSite,
      });
    } catch (error) {
      console.error("Error updating link order:", error);
      res.status(500).json({
        success: false,
        message: "Error updating link order",
        error: error.message,
      });
    }
  }),
  remove: tryCatch(async (req, res) => {
    const user = req.cookies["id"];
    const { itemId } = req.body;
    const io = req.app.get("io");

    const userSite = await UserSite.findOneAndUpdate(
      { user },
      { $pull: { links: itemId } },
      { new: true }
    ).populate({
      path: "links",
      match: { display: true },
    });

    io.to(`user_${user}`).emit("site:update", {
      type: "SITE_UPDATE",
      payload: {
        item: itemId,
        removed: itemId,
        site: userSite,
      },
    });

    if (!userSite) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item removed successfully", userSite });
  }),
};

export default UserSiteController;
