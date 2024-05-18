import { Header } from "../models/header.mjs";
import { tryCatch } from "../utils/tryCatch.mjs";
import "dotenv";

const headerController = {
  index: tryCatch(async (req, res) => {
    const headers = await Header.find();

    if (!headers) {
      return res.json({
        message: "Headers not found",
      });
    }
    res.json(headers);
  }),
  id: tryCatch(async (req, res) => {
    const user = req.body.user;
    const headers = await Header.find();

    if (!headers) {
      return res.status(404).json({ message: "Header not found" });
    }
    res.json(headers);
  }),
  create: tryCatch(async (req, res) => {
    const { header, user } = req.body;

    const newHeader = Header({
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

    const updatedHeader = await Header.findByIdAndUpdate(
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
    const header = await Header.findByIdAndDelete({ _id: req.params.id });

    if (!header) {
      return res.status(404).json({ message: "Header not found" });
    }

    res.json({ message: "Header Has Been Removed" });
  }),
};

export default headerController;
