import { Router } from "express";
import headerController from "../controller/header.mjs";
import isAuthenticated from "../middleware/passport.mjs";

const router = Router();

router.get("/", isAuthenticated(), headerController.index);
router.post("/new", isAuthenticated(), headerController.create);
router.put("/:id", isAuthenticated(), headerController.upadte);
router.delete("/:id", isAuthenticated(), headerController.remove);

export default router;
