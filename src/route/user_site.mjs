import { Router } from "express";
import UserSiteController from "../controller/user_site.mjs";
import isAuthenticated from "../middleware/passport.mjs";
import { uploadFields } from "../utils/multer.mjs";

// const uploadMiddleware = upload.array("avatar");

// const uploadMiddleware = upload.fields([
//   { name: "avatar", maxCount: 1 },
//   { name: "bgImage", maxCount: 1 },
// ]);

const router = Router();
router.get("/site/:slug", UserSiteController.index);
router.get("/site", UserSiteController.id);
router.post("/create", uploadFields, UserSiteController.create);
router.put("/update", uploadFields, UserSiteController.update);
router.put("/addLinks", UserSiteController.addLinks);
router.put("/addHeaders", UserSiteController.addHeaders);
router.put("/reorder", UserSiteController.reorder);
router.delete("/remove", UserSiteController.remove);
router.get("/protected", isAuthenticated, (req, res, next) => {
  // console.log("protect ed:", req.cookies["jwt"]);
  res.status(200).json({
    success: true,
    msg: "You are successfully authenticated to this route!",
  });
});

export default router;
