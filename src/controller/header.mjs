import { Header } from "../models/header.mjs";
import { tryCatch } from "../utils/tryCatch.mjs";
import "dotenv";

const headerController = {
  index: tryCatch(async (req, res) => {
    const user = req.cookies["id"];

    const headers = await Header.find({ user: user }).sort({ updatedAt: -1 });

    if (!headers) {
      return res.json({
        message: "Headers not found",
      });
    }
    res.json(headers);
  }),
  id: tryCatch(async (req, res) => {
    const headers = await Header.find();

    if (!headers) {
      return res.status(404).json({ message: "Header not found" });
    }
    res.json(headers);
  }),
  create: tryCatch(async (req, res) => {
    const { title } = req.body;
    const id = req.cookies["id"];

    const newHeader = Header({
      user: id,
      title: title,
      display: title == "" ? false : true,
      type: "Header",
    });

    const addHeader = await newHeader.save();
    res.json(addHeader);
  }),
  upadte: tryCatch(async (req, res) => {
    const { title, index } = req.body;

    const updatedHeader = await Header.findByIdAndUpdate(
      req.params.id,
      {
        title,
        display: title == "" ? false : true,
        index: index,
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
