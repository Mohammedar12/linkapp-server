import { Links } from "../models/links.mjs";
import { tryCatch } from "../utils/tryCatch.mjs";
import "dotenv";

const linksController = {
  index: tryCatch(async (req, res) => {
    const links = await Links.find();

    if (!links) {
      return res.json({
        status: false,
        message: "Sorry No Links  Found",
      });
    }
    res.json(links);
  }),
  id: tryCatch(async (req, res) => {
    const user = req.body.user;
    const links = await Links.find();
    res.json(links);
  }),
  create: tryCatch(async (req, res) => {
    const { url, title } = req.body;

    const extractDomain = (url) => {
      const pattern = /(?:https?:\/\/)?(?:www\.)?([^\/.:]+)/;
      const match = url.match(pattern);
      return match ? match[1] : null;
    };

    const domain = extractDomain(url);

    const newLink = Links({
      url: url,
      title: title || domain,
      type: "Link",
      display: url == "" ? false : true,
    });

    const addlink = await newLink.save();
    res.json(addlink);
  }),
  upadte: tryCatch(async (req, res) => {
    const { url, title } = req.body;

    const updatedLink = await Links.findByIdAndUpdate(
      req.params.id,
      {
        url,
        title,
        display: url == "" ? false : true,
      },
      { new: true }
    );

    if (!updatedLink) {
      return res.status(404).json({ message: "Link not found" });
    }

    res.json(updatedLink);
  }),
  remove: tryCatch(async (req, res) => {
    const links = await Links.findByIdAndDelete({ _id: req.params.id });
    if (!links) {
      return res.status(404).json({ message: "links not found" });
    }

    res.json({ message: "links Has Been Removed" });
  }),
};

export default linksController;
