const Headers = require("../models/header");
const { tryCatch } = require("../utils/tryCatch");
require("dotenv");

module.exports = {
  index: tryCatch(async (req, res) => {
    const headers = await Headers.find();

    if (!headers) {
      return res.json({
        message: "Headers not found",
      });
    }
    res.json(headers);
  }),
  id: tryCatch(async (req, res) => {
    const user = req.body.user;
    const headers = await Headers.find();

    if (!headers) {
      return res.status(404).json({ message: "Header not found" });
    }
    res.json(headers);
  }),
  create: tryCatch(async (req, res) => {
    const { header, user } = req.body;

    const newHeader = Headers({
      header: header,
      display: header == "" ? false : true,
      type: "Header",
      user,
    });

    const addHeader = await newHeader.save();
    res.json(addHeader);
  }),
  upadte: tryCatch(async (req, res) => {
    const { header } = req.body;

    const updatedHeader = await Headers.findByIdAndUpdate(
      req.params.id,
      {
        header,
        display: header == "" ? false : true,
      },
      { new: true }
    );

    if (!updatedHeader) {
      return res.status(404).json({ message: "Header not found" });
    }

    res.json(updatedHeader);
  }),
  remove: tryCatch(async (req, res) => {
    const header = await Headers.findByIdAndDelete({ _id: req.params.id });

    if (!header) {
      return res.status(404).json({ message: "Header not found" });
    }

    res.json({ message: "Header Has Been Removed" });
  }),
};
