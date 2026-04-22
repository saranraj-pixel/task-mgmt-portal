const express = require("express");
const router = express.Router();

const {
  getAdminDashboard,
  adminLogin,
  inviteUser,
} = require("../controllers/adminController");

const {
  verifyInvitation,
  registerWithInvite,
} = require("../controllers/adminController");

const { protectRoute } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

/* ---------------- ADMIN AUTH ---------------- */
router.post("/login", adminLogin);

/* ---------------- DASHBOARD ---------------- */
router.get("/dashboard", protectRoute, isAdmin, getAdminDashboard);

/* ---------------- INVITE SYSTEM (ADMIN ONLY) ---------------- */
router.post("/invite", protectRoute,isAdmin, inviteUser);

/* ---------------- PUBLIC INVITE FLOW ---------------- */
router.get("/verify-invite/:token", verifyInvitation);
router.post("/register-invite", registerWithInvite);

module.exports = router;