const router = require("express").Router();
const {
  userRegistration,
  userLogin,
  userLogout,
} = require("../controllers/user/authController");

router.post("/user/registration", userRegistration);
router.post("/user/login", userLogin);
router.post("/user/logout", userLogout);

module.exports = router;
