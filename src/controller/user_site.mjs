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
    const site = await UserSite.findOne({ user: id }).populate("links");

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
    console.log(user.isVerified, "user site active user.isVerified");
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
    );
    await User.findOneAndUpdate({ _id: id }, { username: fieldsToUpdate.slug });

    res.json(updatedSite);
  }),
  addLinks: tryCatch(async (req, res) => {
    const { links } = req.body;
    const id = req.cookies["id"];
    const userSite = await UserSite.findOneAndUpdate(
      { user: id },
      {
        $push: {
          links: links,
        },
      },
      { new: true, useFindAndModify: false }
    );
    const site = await userSite.save();
    res.json(site);
  }),
  reorder: tryCatch(async (req, res) => {
    const id = req.cookies["id"];
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

    const userSite = await UserSite.findOneAndUpdate(
      { user },
      { $pull: { links: itemId } }, // Changed from { _id: itemId } to itemId
      { new: true }
    );

    if (!userSite) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item removed successfully", userSite });
  }),
};

export default UserSiteController;
