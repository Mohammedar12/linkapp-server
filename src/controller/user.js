const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Session = require("../models/session");
const bcrypt = require("bcrypt");
const { tryCatch } = require("../utils/tryCatch");
require("dotenv");

module.exports = {
  signUp: tryCatch(async (req, res) => {
    const { email, password, phone, role, avatar } = req.body;

    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.status(409).json({ message: "User Already Exists ! " });
    }
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(password, saltRounds);

    const token = await jwt.sign(email, process.env.JWT_SECRET);

    const newUser = User({
      username: username,
      phone: phone,
      password: passwordHash,
    });

    const user = await newUser.save();
    res.json(user);
  }),
  login: tryCatch(async (req, res) => {
    const { email, password, role, avatar } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(409).json({ message: "User Not Exists !" });
    }

    const checkPass = bcrypt.compareSync(password, user.password);
    if (!checkPass) {
      return res
        .status(409)
        .json({ message: "User or Password not correct !" });
    }

    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    let currentDate = new Date();

    let expiry = new Date(currentDate.getTime() + process.env.MAX_AGE * 1);

    await Session.create({
      user: user.id,
      sessionId: req.session.id,
      expireAt: expiry,
    });

    req.session.user = user;

    return res.status(200).json({
      username: user.username,
      token,
      userId: user._id,
      avatar: user.avatar.url,
      createdAt: user.createdAt,
    });
  }),
  logout: tryCatch(async (req, res) => {
    if (req?.session) {
      if (req?.session?.id) {
        await Session.findOneAndDelete({ sessionId: req.session.id });
      }
      req.session.destroy();
      res.clearCookie("session");
    }
    return res.status(200).json({
      status: 200,
      message: "Logged out successfully",
    });
  }),
};
