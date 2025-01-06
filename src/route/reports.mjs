import { Router } from "express";
import SiteReportsController from "../controller/reports.mjs";
// import isAuthenticated from "../middleware/passport.mjs";
// import { uploadFields } from "../utils/multer.mjs";
// import validator from "../middleware/validator.mjs";
// import { createUserSiteSchema } from "../validation/user_site.validation.mjs";

import cacheMiddleware from "../utils/cacheMiddleware.mjs";
import limiter from "../utils/limiter.mjs";

const router = Router();

router.get("/get", SiteReportsController.getReports);
router.put("/update", SiteReportsController.addReports);

export default router;
