const router = require("express").Router();
const headerController = require("../controller/header");
const isAuthenticated = require("../middleware/auth");
const validator = require("../middleware/validator");
const headerValidation = require("../validation/header");

router.get(
  "/",
  isAuthenticated,
  validator(headerValidation.getHeader),
  headerController.index
);
router.post(
  "/new",
  isAuthenticated,
  validator(headerValidation.postHeader),
  headerController.create
);
router.put(
  "/:id",
  isAuthenticated,
  validator(headerValidation.updateHeader),
  headerController.upadte
);
router.delete("/:id", isAuthenticated, headerController.remove);

module.exports = router;
