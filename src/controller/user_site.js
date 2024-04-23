const UserSite = require("../models/user_site");
const { tryCatch } = require("../utils/tryCatch");
require("dotenv");

module.exports = {
  index: tryCatch(async (req, res) => {
    const slug = req.params.slug;
    const site = await UserSite.findOne({ slug });

    if (!site) {
      return res.json({
        status: false,
        message: "Sorry This Site Not Exist",
      });
    }
    res.json(site);
  }),
  id: tryCatch(async (req, res) => {
    const user = req.body.user;
    const site = await UserSite.find();
    res.json(site);
  }),
  create: tryCatch(async (req, res) => {
    const { sitename, slug, links, thame, about, avatar } = req.body;

    const newSite = UserSite({
      sitename: sitename,
      slug: sitename,
      links: links,
      thame: thame,
      about: about,
      avatar: avatar,
    });

    const site = await newSite.save();
    res.json(site);
  }),
};
