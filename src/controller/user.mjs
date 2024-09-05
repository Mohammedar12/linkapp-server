import { User } from "../models/user.mjs";
import { tryCatch } from "../utils/tryCatch.mjs";
import generateToken from "../utils/jwt.mjs";
import "dotenv";
import client from "./../services/redis.mjs";

import { genPassword, validPassword } from "../utils/password.mjs";

const UserController = {
  user: tryCatch(async (req, res) => {
    const id = req.cookies["id"];

    const user = await User.findById({ _id: id });

    if (!user) {
      return res.status(401).json({ message: "User Not Exists !" });
    }

    res.json(user);
  }),
  signUp: tryCatch(async (req, res) => {
    const { email, password, username, role, avatar } = req.body;

    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.status(401).json({ message: "User Already Exists ! " });
    }

    const saltHash = genPassword(password);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = User({
      email: email,
      username: username,
      hash: hash,
      salt: salt,
    });

    const user = await newUser.save();

    // Generate a JWT token for the new user
    const token = generateToken(user);

    // Set the JWT token in a cookie
    res.cookie("jwt", token, {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
    });

    res.cookie("id", user._id, {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
    });

    res.json({
      email: user.email,
      token,
      userId: user._id,
      avatar: user.avatar.url,
      createdAt: user.createdAt,
    });
  }),
  login: tryCatch(async (req, res) => {
    const { email, password, role, avatar } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User Not Exists !" });
    }

    const checkPass = validPassword(password, user.hash, user.salt);
    if (!checkPass) {
      return res
        .status(409)
        .json({ message: "User or Password not correct !" });
    }

    const token = generateToken(user);

    res.cookie("jwt", token, {
      secure: false,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("id", user._id, {
      secure: false,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      email: user.email,
      token,
      userId: user._id,
      avatar: user.avatar.url,
      createdAt: user.createdAt,
    });
  }),
  logout: tryCatch(async (req, res) => {
    const tokenId = req.cookies["jwt"].token;
    const id = req.cookies["id"];
    console.log(req);

    if (!tokenId) {
      res.json({ message: "Tokens not found or invalid format" });
    }
    const redisUserRecord = await client.get(String(id));
    console.log("Record: ", redisUserRecord);
    if (redisUserRecord) {
      const parsedData = JSON.parse(redisUserRecord);
      parsedData[String(id)].push(tokenId);
      client.setEx(String(id), 7 * 24 * 60, JSON.stringify(parsedData));
      // console.log("Data: ", parsedData);
    } else {
      const blacklistedData = {
        [String(id)]: [tokenId],
      };

      client.setEx(String(id), 7 * 24 * 60, JSON.stringify(blacklistedData));
    }
    res.clearCookie("jwt");
    res.clearCookie("id");
    res.json({ message: "Good Bye!" });
  }),
};

export default UserController;
