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
const { createTaskValidation } = require("../middleware/validation/createTaskValidation");
const { validate } = require("../middleware/validation/commonValidation");
const { idValidation } = require("../middleware/validation/idValidation");
const { updateTaskValidation } = require("../middleware/validation/updateTaskValidation");

// Protect all routes
router.use(protectRoute);

// Routes
router.post("/", createTaskValidation, validate, createTask);
router.get("/", getAllTasks);
router.get("/stats", getTaskStats);
router.get("/:id",idValidation, validate, getTaskById);
router.put("/:id",updateTaskValidation, idValidation, validate, updateTask);
router.delete("/:id",idValidation, validate, deleteTask);

module.exports = router;
