const express = require("express");
const router = express.Router();

const { createTask, getAllTasks } = require("../controllers/taskController");

const { protectRoute } = require("../middleware/authMiddleware");

// Protect all routes
router.use(protectRoute);

// Routes
router.post("/", createTask);
router.get("/", getAllTasks);

module.exports = router;
