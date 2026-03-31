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

    // total tasks count for this user
    const totalCount = await Task.countDocuments({
      createdBy: req.user.userId,
    });

    // fetch tasks
    const tasks = await Task.find({
      createdBy: req.user.userId,
    })
      .sort({ createdAt: -1 })
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
