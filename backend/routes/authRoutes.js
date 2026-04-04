const express = require("express");
const { registerUser, loginUser, logoutUser } = require("../controllers/authController");
const { registerValidation, validate } = require("../middleware/validation/commonValidation");
const router = express.Router();

router.post("/login", loginUser);
router.post("/register",registerValidation, validate, registerUser);
router.post("/logout", logoutUser);

module.exports = router;
