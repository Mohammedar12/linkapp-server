import { Links } from "../models/links.mjs";
import { tryCatch } from "../utils/tryCatch.mjs";
import "dotenv";

const linksController = {
  index: tryCatch(async (req, res) => {
    const user = req.cookies["id"];
    const links = await Links.find({ user });

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
    const { url, title, type } = req.body;
    const id = req.cookies["id"];
    const extractDomain = (url) => {
      const pattern = /(?:https?:\/\/)?(?:www\.)?([^\/.:]+)/;
      const match = url.match(pattern);
      return match ? match[1] : null;
    };

    const domain = extractDomain(url);

    const newLink = Links({
      user: id,
      url: type !== "Header" && url,
      title: title || domain,
      type: type,
      display: title == "" ? false : true,
    });

    const addlink = await newLink.save();
    res.json(addlink);
  }),
  addClicks: tryCatch(async (req, res) => {
    const id = req.params.id;

    const links = await Links.findById(id);

    console.log(links);

    const updatedLink = await Links.findByIdAndUpdate(
      { _id: id },
      { clicks: links.clicks + 1 },
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
