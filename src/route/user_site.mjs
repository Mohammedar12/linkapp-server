import { Router } from "express";
import UserSiteController from "../controller/user_site.mjs";
import isAuthenticated from "../middleware/passport.mjs";
import { uploadFields } from "../utils/multer.mjs";
import validator from "../middleware/validator.mjs";
import { createUserSiteSchema } from "../validation/user_site.validation.mjs";

import cacheMiddleware from "../utils/cacheMiddleware.mjs";
import limiter from "../utils/limiter.mjs";

const router = Router();
router.get("/slug/:slug", UserSiteController.index);
router.get("/site/:id", UserSiteController.id);
router.post(
  "/create",
  validator(createUserSiteSchema),
  uploadFields,
  UserSiteController.create
);
router.put("/update", uploadFields, UserSiteController.update);
router.post("/addLinks", UserSiteController.addLinks);
router.put("/editLinks/:id", UserSiteController.editLinks);

router.put("/reorder", limiter, UserSiteController.reorder);
router.delete("/remove", UserSiteController.removeLinks);

export default router;
