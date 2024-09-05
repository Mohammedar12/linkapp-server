import { UserSite } from "../models/user_site.mjs";
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
    const slug = req.params.slug;

    const site = await UserSite.findOne({ slug }).populate("links");

    if (!site) {
      return res.json({
        status: false,
        message: "Sorry This Site Not Exist",
      });
    }

    res.json(site);
  }),
  id: tryCatch(async (req, res) => {
    const id = req.cookies["id"];
    const site = await UserSite.findOne({ user: id }).populate("links");

    if (!site) {
      throw new Error("UserSite not found");
    }

    res.json(site);
  }),
  create: tryCatch(async (req, res) => {
    const { social, slug, title, theme, about, skills } = req.body;
    const id = req.cookies["id"];

    let avatar = null;

    if (req.files) {
      if (req.files.avatar) {
        avatar = await handleFileUpload(req.files.avatar[0], "avatar");
      }
    }

    const newSite = new UserSite({
      user: id,
      slug,
      social: JSON.parse(social),
      about,
      avatar,
      title,
      theme,
      skills: JSON.parse(skills),
    });

    const site = await newSite.save();
    res.json(site);
  }),
  update: tryCatch(async (req, res) => {
    const { social, slug, title, about, skills, location, experience } =
      req.body;
    let { theme } = req.body;
    const id = req.cookies["id"];

    let avatar = null;
    let bgImage = null;

    // Handle file uploads
    if (req.files) {
      if (req.files.avatar) {
        avatar = await handleFileUpload(req.files.avatar[0], "avatar");
      }
      if (req.files.bgImage) {
        bgImage = await handleFileUpload(req.files.bgImage[0], "backgrounds");
      }
    }

    // Parse theme if it's defined
    if (theme) {
      try {
        theme = JSON.parse(theme);
        theme.bgImage = bgImage;
      } catch (error) {
        return res.status(400).json({ message: "Invalid theme JSON" });
      }
    }

    // Retrieve the existing document
    const existingSite = await UserSite.findOne({ user: id });
    if (!existingSite) {
      return res.status(404).json({ message: "Site not found" });
    }

    // Construct the new fields object, with checks for undefined values
    const newFields = {
      slug,
      social: social ? JSON.parse(social) : existingSite.social,
      about,
      avatar: avatar || existingSite.avatar,
      title,
      location,
      experience,
      theme: theme || existingSite.theme,
      skills: skills ? JSON.parse(skills) : existingSite.skills,
    };

    // Use lodash to compare and only keep changed fields
    const fieldsToUpdate = _.omitBy(newFields, (value, key) => {
      return _.isEqual(value, _.get(existingSite, key));
    });

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

    console.log(updatedSite);
    res.json(updatedSite);
  }),
  // update: tryCatch(async (req, res) => {
  //   const { social, slug, title, about, skills, location, experience } =
  //     req.body;

  //   let { theme } = req.body;
  //   const id = req.cookies["id"];

  //   let avatar = null;
  //   let bgImage = null;

  //   if (req.files) {
  //     if (req.files.avatar) {
  //       avatar = await handleFileUpload(req.files.avatar[0], "avatar");
  //     }
  //     if (req.files.bgImage) {
  //       bgImage = await handleFileUpload(req.files.bgImage[0], "backgrounds");
  //     }
  //   }

  //   if (theme) {
  //     theme = JSON.parse(theme);
  //     theme.bgImage = bgImage;
  //   }

  //   let updatedValues = {};

  //   const updateSite = await UserSite.findOneAndUpdate(
  //     { user: id },
  //     {
  //       slug,
  //       social: JSON.parse(social),
  //       about,
  //       avatar,
  //       title,
  //       location,
  //       experience,
  //       theme,
  //       skills: JSON.parse(skills),
  //     },
  //     { new: true }
  //   );

  //   console.log(updateSite);

  //   if (!updateSite) {
  //     return res.status(404).json({ message: "Link not found" });
  //   }

  //   res.json(updateSite);
  // }),

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
  addHeaders: tryCatch(async (req, res) => {
    const { headers } = req.body;
    const id = req.cookies["id"];
    const userSite = await UserSite.findOneAndUpdate(
      { user: id },
      {
        $push: {
          items: { id: headers, itemType: "Header", item: headers, index: 0 },
        },
      },
      { new: true, useFindAndModify: false }
    );

    const site = await userSite.save();
    console.log(site);
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
