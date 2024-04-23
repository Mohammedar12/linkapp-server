const router = require("express").Router();
const UserController = require("../controller/user");
const isAuthenticated = require("../middleware/auth");

router.post("/sign-up", UserController.signUp);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);

module.exports = router;
