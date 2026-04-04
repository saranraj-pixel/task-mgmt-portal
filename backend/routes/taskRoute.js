const express = require("express");
const router = express.Router();

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
} = require("../controllers/taskController");

const { protectRoute } = require("../middleware/authMiddleware");
const { createTaskValidation, validate } = require("../middleware/validation/commonValidation");

// Protect all routes
router.use(protectRoute);

// Routes
router.post("/", createTaskValidation, validate, createTask);
router.get("/", getAllTasks);
router.get("/stats", getTaskStats);
router.get("/:id", getTaskById);
router.put("/:id",createTaskValidation, validate, updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
