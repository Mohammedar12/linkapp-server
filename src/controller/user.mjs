import { User } from "../models/user.mjs";
import { tryCatch } from "../utils/tryCatch.mjs";
import generateToken from "../utils/jwt.mjs";
import "dotenv";
import crypto from "crypto";
import client from "./../services/redis.mjs";
import nodemailer from "nodemailer";
import { genPassword, validPassword } from "../utils/password.mjs";

import { fileURLToPath } from "url";
import path from "path";
import { sendSendTemplateMail } from "../services/mail.mjs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateVerifyToken() {
  return crypto.randomBytes(32).toString("hex");
}

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

    let verifyToken = generateVerifyToken();
    const tokenExpiration = new Date(Date.now() + 15 * 60 * 1000);

    let verificationLink = `${process.env.ALLOWED_ORIGIN}/verify?verifyToken=${verifyToken}`;

    const newUser = User({
      email: email,
      username: username,
      hash: hash,
      salt: salt,
      authType: "local",
    });

    const user = await newUser.save();

    // Generate a JWT token for the new user
    const token = generateToken(user);

    // Set the JWT token in a cookie
    res.cookie("jwt", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("id", user._id, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("isVerified", user.isVerified, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("registerSteps", user.registerSteps, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        email: user.email,
        userId: user._id,
        username: user.username,
      },
      token,
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("id", user._id, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("isVerified", user.isVerified, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("registerSteps", user.registerSteps, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
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
  googleAuth: tryCatch(async (req, res) => {
    console.log("Successfully authenticated with Google");

    const { user, token } = req.user;

    res.cookie("jwt", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
    });

    res.cookie("registerSteps", user.registerSteps, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Set to true if using HTTPS
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
    });

    res.cookie("isVerified", user.isVerified, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Set to true if using HTTPS
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
    });

    res.cookie("id", user._id, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const redirectUrl = user.registerSteps
      ? "admin?authenticated=true"
      : "signup/startup?authenticated=true";
    res.redirect(`${process.env.ALLOWED_ORIGIN}/${redirectUrl}`);
  }),
  update: tryCatch(async (req, res) => {
    const { registerSteps } = req.body;

    const id = req.cookies["id"];

    const user = await User.findByIdAndUpdate(
      id,
      { registerSteps: registerSteps },
      { new: true }
    );

    if (!user) {
      return res.status(401).json({ message: "User Not Exists !" });
    }

    res.cookie("registerSteps", registerSteps, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      user,
    });
  }),
  verifyUser: tryCatch(async (req, res) => {
    const { verifyToken } = req.query;
    const id = req.cookies["id"];

    console.log("User ID from cookie:", id);

    if (!verifyToken) {
      return res.status(400).json({ message: "Missing verification token" });
    }

    if (!id) {
      return res.status(400).json({
        message: "User ID not found in cookies. Please log in again.",
      });
    }

    let user;
    try {
      user = await User.findById(id);
    } catch (error) {
      console.error("Error finding user:", error);
      return res.status(500).json({ message: "Error finding user" });
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(200)
        .json({ message: "User is already verified", alreadyVerified: true });
    }

    if (user.verifyToken !== verifyToken) {
      return res.status(401).json({ message: "Invalid verification token" });
    }

    // Compare the current time with the token expiration date
    const currentTime = new Date();
    if (currentTime > user.tokenExpiration) {
      return res
        .status(401)
        .json({ message: "Token has expired!", expired: true });
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          $set: { isVerified: true },
          $unset: { verifyToken: "", tokenExpiration: "" },
        },
        { new: true }
      );

      const token = generateToken(user);

      res.cookie("jwt", token, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        httpOnly: true,

        domain:
          process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("isVerified", user.isVerified, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        httpOnly: true,

        domain:
          process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "User verified successfully",
        user: {
          id: updatedUser._id,
          token: token,
          email: updatedUser.email,
          isVerified: updatedUser.isVerified,
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Error updating user" });
    }
  }),
  sendVerifyToken: tryCatch(async (req, res) => {
    const id = req.cookies["id"];

    const user = await User.findById({ _id: id });
    const email = user.email;
    if (!user) {
      return res
        .status(401)
        .json({ message: "User Not Exists !", Invalid: true });
    }

    let verifyToken = generateVerifyToken();
    const tokenExpiration = new Date(Date.now() + 15 * 60 * 1000);

    let verificationLink = `${process.env.ALLOWED_ORIGIN}/verify?verifyToken=${verifyToken}`;

    try {
      await sendSendTemplateMail(
        email,
        "Verify Email",
        path.join(__dirname, "./mail/verify-email.html"),
        {
          verificationLink: verificationLink,
        }
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      {
        $set: { verifyToken: verifyToken, tokenExpiration: tokenExpiration },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "verification token has been sent to your email",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
      },
      updatedUser,
    });
  }),
  forgotPassword: tryCatch(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiration = Date.now() + 3600000; // 1 hour from now

    // Save reset token and expiration to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiration;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.ALLOWED_ORIGIN}/reset-password?token=${resetToken}`;

    // Send email
    try {
      await sendSendTemplateMail(
        email,
        "Password Reset",
        path.join(__dirname, "./mail/reset-password.html"),
        {
          resetUrl: resetUrl,
        }
      );

      res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.error("Failed to send password reset email:", error);
      return res
        .status(500)
        .json({ message: "Failed to send password reset email" });
    }
  }),
  resetPassword: tryCatch(async (req, res) => {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Set new password
    const saltHash = genPassword(password);
    user.hash = saltHash.hash;
    user.salt = saltHash.salt;

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
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
    } else {
      const blacklistedData = {
        [String(id)]: [tokenId],
      };

      client.setEx(String(id), 7 * 24 * 60, JSON.stringify(blacklistedData));
    }
    res.clearCookie("jwt", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Set to true if using HTTPS
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
    });
    res.clearCookie("id", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Set to true if using HTTPS
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
    });
    res.clearCookie("registerSteps", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Set to true if using HTTPS
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
    });
    res.clearCookie("isVerified", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Set to true if using HTTPS
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
    });
    res.json({ message: "Good Bye!" });
  }),
};

export default UserController;
