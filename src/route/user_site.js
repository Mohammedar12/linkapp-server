const router = require("express").Router();
const UserSiteController = require("../controller/user_site");
const isAuthenticated = require("../middleware/auth");

router.get("/site/:slug", isAuthenticated, UserSiteController.index);
router.get("/site", isAuthenticated, UserSiteController.id);
router.post("/create", isAuthenticated, UserSiteController.create);

module.exports = router;
