const mongoose = require("mongoose");
const Task = require("../models/task");

// @desc    Create Task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, status, deadline } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    if (!priority) {
      return res.status(400).json({
        success: false,
        message: "Priority is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!deadline) {
      return res.status(400).json({
        success: false,
        message: "Deadline is required",
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      priority,
      status,
      deadline,
      createdBy: req.user.userId, // from auth middleware
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get All Tasks (User Specific)
// @route   GET /api/tasks
// @access  Private
exports.getAllTasks = async (req, res) => {
  try {
    // pagination params

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // query params

    const {
      status,
      priority,
      deadlineFrom,
      deadlineTo,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Dynamic Filter Object

    const filter = {
      createdBy: req.user.userId,
    };

    // status filter

    if (status) {
      filter.status = status;
    }

    // priority filter

    if (priority) {
      filter.priority = priority;
    }

    // Deadline Range Filter

    if (deadlineFrom || deadlineTo) {
      filter.deadline = {};

      if (deadlineFrom) {
        filter.deadline.$gte = new Date(deadlineFrom);
      }

      if (deadlineTo) {
        filter.deadline.$lte = new Date(deadlineTo);
      }
    }

    // Case-Insensitive Search

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting

    const sortOrder = order === "asc" ? 1 : -1;

    // Execute Query

    const totalCount = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      tasks,
      totalCount,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get single task
// @route GET /api/tasks/:id
// @access Private
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }

    const task = await Task.findById(id).populate("createdBy", "name email");

    // Task not found
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Ownership check
    if (task.createdBy._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this task",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Update task
// @route PUT /api/tasks/:id
// @access Private
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }

    const task = await Task.findById(id);

    // Not found
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Ownership validation
    if (task.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // Allowed fields
    const allowedFields = [
      "title",
      "description",
      "priority",
      "status",
      "deadline",
      "assignedTo",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id).populate(
      "createdBy",
      "name email",
    );

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: populatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Delete task
// @route DELETE /api/tasks/:id
// @access Private
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }

    const task = await Task.findById(id);

    // Not found
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Ownership validation
    if (task.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
