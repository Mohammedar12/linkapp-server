const router = require("express").Router();
const linkController = require("../controller/links");
const isAuthenticated = require("../middleware/auth");
const validator = require("../middleware/validator");
const linkValidation = require("../validation/links");

router.get(
  "/",
  isAuthenticated,
  validator(linkValidation.getLink),
  linkController.index
);
router.post(
  "/new",
  isAuthenticated,
  validator(linkValidation.postLink),
  linkController.create
);
router.put(
  "/:id",
  isAuthenticated,
  validator(linkValidation.updateLink),
  linkController.upadte
);
router.delete("/:id", isAuthenticated, linkController.remove);

module.exports = router;
