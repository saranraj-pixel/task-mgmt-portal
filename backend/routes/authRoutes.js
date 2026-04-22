const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  changePassword,
  adminLogin,
  getUsers,
} = require("../controllers/authController");
const { protectRoute } = require("../middleware/authMiddleware");
const { registerValidation } = require("../middleware/validation/registerValidation");
const { validate } = require("../middleware/validation/commonValidation");
const { loginValidation } = require("../middleware/validation/loginValidation");
const { updateProfileValidation } = require("../middleware/validation/updateProfileValidation");
const { changePasswordValidation } = require("../middleware/validation/changePasswordValidation");
const { isAdmin } = require("../middleware/roleMiddleware");
const router = express.Router();

router.post("/login",loginValidation, validate, loginUser);
router.post("/register", registerValidation, validate, registerUser);
router.post("/logout",protectRoute, logoutUser);

router.get("/me", protectRoute, getMe);
router.put("/profile", protectRoute,updateProfileValidation, validate, updateProfile);
router.put("/change-password", protectRoute, changePasswordValidation, validate, changePassword);

router.post("/admin/login", adminLogin);
router.get(
  "/admin/dashboard",
  protectRoute,
  isAdmin,
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

router.get('/users', getUsers);

module.exports = router;
