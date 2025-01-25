import { Router } from "express";
import linkController from "../controller/links.mjs";
import isAuthenticated from "../middleware/passport.mjs";
const router = Router();
router.get("/", isAuthenticated(), linkController.index);
router.post("/new", isAuthenticated(), linkController.create);
router.post("/:id", linkController.addClicks);
router.delete("/:id", isAuthenticated(), linkController.remove);

export default router;
