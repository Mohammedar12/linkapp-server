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
router.get("/site/:id", isAuthenticated(), UserSiteController.id);
router.post(
  "/create",
  isAuthenticated(),
  validator(createUserSiteSchema),
  uploadFields,
  UserSiteController.create
);
router.put(
  "/update",
  isAuthenticated(),
  uploadFields,
  UserSiteController.update
);
router.post("/addLinks", isAuthenticated(), UserSiteController.addLinks);
router.put("/editLinks/:id", isAuthenticated(), UserSiteController.editLinks);

router.put("/reorder", limiter, isAuthenticated(), UserSiteController.reorder);
router.delete("/remove", isAuthenticated(), UserSiteController.removeLinks);

export default router;
