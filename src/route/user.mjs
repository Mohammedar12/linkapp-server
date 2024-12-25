import { Router } from "express";
import UserController from "../controller/user.mjs";
import isAuthenticated from "../middleware/passport.mjs";
import validator from "../middleware/validator.mjs";
import {
  updateUserSchema,
  signupSchema,
  loginSchema,
} from "../validation/user.validation.mjs";
import cacheMiddleware from "../utils/cacheMiddleware.mjs";
import passport from "passport";

const router = Router();
router.get("/user", isAuthenticated, UserController.user);
router.post("/sign-up", validator(signupSchema), UserController.signUp);
router.get(
  "/auth/google",
  (req, res, next) => {
    console.log("Initiating Google OAuth flow");
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  (req, res, next) => {
    console.log("Received callback from Google");
    next();
  },
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),

  UserController.googleAuth

  // (req, res) => {
  //   console.log("Successfully authenticated with Google");

  //   const { user, token } = req.user;

  //   res.cookie("jwt", token, {
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: "lax",
  //     httpOnly: true,
  //     domain:
  //       process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
  //   });

  //   res.cookie("registerSteps", user.registerSteps, {
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: "lax", // Set to true if using HTTPS
  //     httpOnly: true,
  //     domain:
  //       process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
  //   });

  //   res.cookie("isVerified", user.isVerified, {
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: "lax", // Set to true if using HTTPS
  //     httpOnly: true,
  //     domain:
  //       process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
  //   });

  //   res.cookie("id", user._id, {
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: "lax",
  //     httpOnly: true,
  //     domain:
  //       process.env.NODE_ENV === "production" ? ".waslsa.com" : "localhost",
  //     maxAge: 7 * 24 * 60 * 60 * 1000,
  //   });

  //   const redirectUrl = user.registerSteps
  //     ? "admin?authenticated=true"
  //     : "signup/startup?authenticated=true";
  //   res.redirect(`${process.env.ALLOWED_ORIGIN}/${redirectUrl}`);
  // }
);
router.post("/login", validator(loginSchema), UserController.login);
router.put(
  "/updateuser",
  validator(updateUserSchema),
  isAuthenticated,
  UserController.update
);
router.get("/verify", UserController.verifyUser);
router.put("/send-verifyToken", UserController.sendVerifyToken);
router.post("/logout", UserController.logout);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);

export default router;
