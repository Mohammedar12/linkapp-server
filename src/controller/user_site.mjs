import { UserSite } from "../models/user_site.mjs";
import { User } from "../models/user.mjs";
import { Links } from "../models/links.mjs";
import { tryCatch } from "../utils/tryCatch.mjs";
import { upload } from "../utils/cloudinary.mjs";
import TextToSVG from "text-to-svg";
import mongoose from "mongoose";
import fs from "fs";
import "dotenv/config";
import _ from "lodash";

const handleFileUpload = async (file, dir) => {
  if (!file) return null;

  const { path } = file;
  const uploadedFile = await upload(path, `app/${dir}`);
  await fs.unlinkSync(path);
  return uploadedFile;
};

const textToSVG = TextToSVG.loadSync(
  "./assets/nexa-rust.handmade-extended.otf"
);

const attributes = { fill: "", stroke: "black" };
const options = {
  x: 0,
  y: 0,
  fontSize: 72,
  anchor: "top",
  attributes: attributes,
};

const UserSiteController = {
  index: tryCatch(async (req, res) => {
    const slug = req.params.slug;

    const site = await UserSite.findOne({ slug }).populate({
      path: "links",
      match: { display: true },
    });

    if (!site) {
      return res.json({
        isExists: false,
        isActive: false,
        message: "Sorry This Site Not Exist",
      });
    }

    if (!site.isActive) {
      return res.json({
        isExists: true,
        isActive: site.isActive,
        message: "the site not active yet",
      });
    }

    return res.json(site);
  }),

  id: tryCatch(async (req, res) => {
    const id = req.cookies["id"];
    const jwt = req.cookies["authenticated"];
    const site = await UserSite.findOne({ user: id }).populate("links");

    if (!site) {
      return res.status(404).json({ error: "The site not exist" });
    }

    return res.json(site);
  }),

  create: tryCatch(async (req, res) => {
    const { social, slug, title, theme, about, skills } = req.body;
    const id = req.cookies["id"];
    const user = await User.findById({ _id: id });

    const svgSlug = textToSVG.getD(slug, options);

    const avatar = req.files?.avatar
      ? await handleFileUpload(req.files.avatar[0], "avatar")
      : null;

    const formattedSlug = slug?.replace(/\s+/g, "-").toLowerCase();
    const newSite = new UserSite({
      user: id,
      slug: formattedSlug || slug,
      social: JSON.parse(social),
      svgSlug: svgSlug,
      about,
      avatar,
      title,
      isActive: user.isVerified || false,
      theme: JSON.parse(theme),
      skills: JSON.parse(skills),
    });

    await User.findOneAndUpdate({ _id: id }, { username: newSite.slug });
    const site = await newSite.save();
    return res.json(site);
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

    // Handle file uploads
    const avatar = req.files?.avatar
      ? await handleFileUpload(req.files.avatar[0], "avatar")
      : null;
    const bgImage = req.files?.bgImage
      ? await handleFileUpload(req.files.bgImage[0], "backgrounds")
      : null;

    // Parse theme
    let theme = req.body.theme ? JSON.parse(req.body.theme) : null;
    if (bgImage && theme) {
      theme.bgImage = bgImage;
    }

    const existingSite = await UserSite.findOne({ user: id });
    if (!existingSite) {
      return res.status(404).json({ message: "Site not found" });
    }

    const formattedSlug = slug?.replace(/\s+/g, "-").toLowerCase();
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

    if (slug) {
      const svgSlug = textToSVG.getD(slug, options);
      newFields.svgSlug = svgSlug;
    }

    const fieldsToUpdate = _.omitBy(newFields, (value, key) =>
      _.isEqual(value, _.get(existingSite, key))
    );

    if (_.isEmpty(fieldsToUpdate)) {
      return res.json(existingSite);
    }

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

    return res.json(updatedSite);
  }),

  addLinks: tryCatch(async (req, res) => {
    const { url, title, type } = req.body;
    const id = req.cookies["id"];
    const io = req.app.get("io");

    const extractDomain = (url) => {
      const pattern = /(?:https?:\/\/)?(?:www\.)?([^\/.:]+)/;
      const match = url.match(pattern);
      return match ? match[1] : null;
    };

    const domain = extractDomain(url);
    const newLink = await Links.create({
      user: id,
      url: type !== "Header" && url,
      title: title || domain,
      type: type,
      display: title == "" ? false : true,
    });

    const userSite = await UserSite.findOneAndUpdate(
      { user: id },
      { $push: { links: newLink } },
      { new: true, useFindAndModify: false }
    ).populate({
      path: "links",
      match: { display: true },
    });

    await newLink.save();
    await userSite.save();

    io.to(`user_${id}`).emit("site:update", {
      type: "SITE_UPDATE",
      payload: {
        siteId: id,
        updates: userSite.links,
        site: userSite,
      },
    });

    return res.json(newLink);
  }),

  editLinks: tryCatch(async (req, res) => {
    const { url, title, index, display } = req.body;
    const id = req.cookies["id"];
    const io = req.app.get("io");

    const updateData = {
      url,
      title,
      index,
      ...(display !== undefined && { display }),
    };

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

    io.to(`user_${id}`).emit("site:update", {
      type: "SITE_UPDATE",
      payload: {
        siteId: id,
        updates: site.links,
        site: site,
      },
    });

    return res.json(updatedLink);
  }),

  reorder: tryCatch(async (req, res) => {
    const id = req.cookies["id"];
    const io = req.app.get("io");
    const { links } = req.body;

    const userSite = await UserSite.findOne({ user: id });
    if (!userSite) {
      return res.status(404).json({
        success: false,
        message: "User site not found",
      });
    }

    const newLinkOrder = links.map(
      (link) => new mongoose.Types.ObjectId(link.id)
    );
    userSite.links = newLinkOrder;
    await userSite.save();

    const updatedSite = await UserSite.findOne({ user: id }).populate("links");

    io.to(`user_${id}`).emit("site:update", {
      type: "SITE_UPDATE",
      payload: {
        reorder: newLinkOrder,
        site: updatedSite,
      },
    });

    return res.json({
      success: true,
      message: "Order updated successfully",
      site: updatedSite,
    });
  }),

  removeLinks: tryCatch(async (req, res) => {
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

    if (!userSite) {
      return res.status(404).json({ message: "Item not found" });
    }

    io.to(`user_${user}`).emit("site:update", {
      type: "SITE_UPDATE",
      payload: {
        item: itemId,
        removed: itemId,
        site: userSite,
      },
    });

    return res.json({ message: "Item removed successfully", userSite });
  }),
};

export default UserSiteController;
