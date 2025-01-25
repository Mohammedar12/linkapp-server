import { Router } from "express";
import SiteReportsController from "../controller/reports.mjs";
import isAuthenticated from "../middleware/passport.mjs";

import cacheMiddleware from "../utils/cacheMiddleware.mjs";
import limiter from "../utils/limiter.mjs";

const router = Router();

router.get("/get", isAuthenticated(), SiteReportsController.getReports);
router.put("/update", SiteReportsController.addReports);

export default router;
