import { Router } from "express";
import UserController from "../controller/user.mjs";
import isAuthenticated from "../middleware/passport.mjs";
import passport from "passport";

const router = Router();
router.post("/sign-up", UserController.signUp);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);

export default router;
