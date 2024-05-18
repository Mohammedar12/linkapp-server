import { Router } from "express";
import UserSiteController from "../controller/user_site.mjs";
import isAuthenticated from "../middleware/passport.mjs";
const router = Router();
router.get("/site/:slug", UserSiteController.index);
router.get("/site", UserSiteController.id);
router.post("/create", UserSiteController.create);
router.get("/protected", isAuthenticated, (req, res, next) => {
  // console.log("protect ed:", req.cookies["jwt"]);
  res.status(200).json({
    success: true,
    msg: "You are successfully authenticated to this route!",
  });
});

export default router;
