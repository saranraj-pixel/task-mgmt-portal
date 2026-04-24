const mongoose = require("mongoose");
const Task = require("../models/task");
const User = require("../models/user");

// @desc    Create Task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, status, deadline, assignedTo } = req.body;

    if (!title || !description || !priority || !status || !deadline) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ FIX: consistent user id handling
    const creatorId = req.user.userId || req.user.id;

    if (!creatorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: missing user id",
      });
    }

    // validate assigned user
    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found",
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      deadline,
      createdBy: creatorId, // 🔥 FIXED
      assignedTo: assignedTo || null,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });

  } catch (error) {
    return res.status(500).json({
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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      status,
      priority,
      deadlineFrom,
      deadlineTo,
      search,
      sortBy = "createdAt",
      order = "desc",
      overdue, 
    } = req.query;

    const userId = req.user.userId;
    const role = req.user.role;

    let filter = {};

    // ROLE LOGIC
    if (role === "admin") {
      filter = {};
    } else {
      filter = {
        $or: [
          { createdBy: userId },
          { assignedTo: userId },
        ],
      };
    }

    // Add other filters (status, priority, etc.)
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    if (deadlineFrom || deadlineTo) {
      filter.deadline = {};
      if (deadlineFrom) filter.deadline.$gte = new Date(deadlineFrom);
      if (deadlineTo) filter.deadline.$lte = new Date(deadlineTo);
    }

    // overdue filter
    if (overdue === "overdue") {
      filter.deadline = { ...filter.deadline, $lt: new Date() };
      filter.status = { $ne: "done" }; // Only show overdue if status is not done
    } else if (overdue === "notOverdue") {
      filter.$or = [
        { deadline: { $gte: new Date() } },
        { status: "done" }
      ];
    }

    if (search) {
      filter.$and = [
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const totalCount = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .populate("assignedTo", "_id name email") // Make sure _id is included
      .populate("createdBy", "_id name email") // Make sure _id is included
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Add relationship info for each task
    const tasksWithRelations = tasks.map(task => {
      const taskObj = task.toObject();
      
      // Convert IDs to strings for comparison
      const createdById = taskObj.createdBy?._id?.toString();
      const assignedToId = taskObj.assignedTo?._id?.toString();
      
      taskObj.relationship = {
        isCreatedByMe: createdById === userId,
        isAssignedToMe: assignedToId === userId,
      };
      
      taskObj.isOverdue = new Date(taskObj.deadline) < new Date() && taskObj.status !== "done";
      
      return taskObj;
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      tasks: tasksWithRelations,
      totalCount,
      currentPage: page,
      totalPages,
      currentUser: {
        id: userId,
        role: role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get Task Statistics
// @route   GET /api/tasks/stats
// @access  Private
exports.getTaskStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const now = new Date();

    const stats = await Task.aggregate([
      {
        $match: {
          $or: [
            { createdBy: userId },
            { assignedTo: userId },
          ],
        },
      },
      {
        $group: {
          _id: null,

          totalTasks: { $sum: 1 },

          completedTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "done"] }, 1, 0],
            },
          },

          inProgressTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0],
            },
          },

          todoTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "todo"] }, 1, 0],
            },
          },

          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ["$deadline", now] },
                    { $ne: ["$status", "done"] },
                  ],
                },
                1,
                0,
              ],
            },
          },

          lowPriority: {
            $sum: {
              $cond: [{ $eq: ["$priority", "low"] }, 1, 0],
            },
          },

          mediumPriority: {
            $sum: {
              $cond: [{ $eq: ["$priority", "medium"] }, 1, 0],
            },
          },

          highPriority: {
            $sum: {
              $cond: [{ $eq: ["$priority", "high"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,

          totalTasks: 1,
          completedTasks: 1,
          inProgressTasks: 1,
          todoTasks: 1,
          overdueTasks: 1,

          completionPercentage: {
            $cond: [
              { $eq: ["$totalTasks", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$completedTasks", "$totalTasks"] },
                  100,
                ],
              },
            ],
          },

          tasksByPriority: {
            low: "$lowPriority",
            medium: "$mediumPriority",
            high: "$highPriority",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        overdueTasks: 0,
        completionPercentage: 0,
        tasksByPriority: {
          low: 0,
          medium: 0,
          high: 0,
        },
      },
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

    const task = await Task.findById(id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

    // Task not found
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

     const userId = req.user.userId;
    const role = req.user.role;

    // FIXED: admin bypass
    if (
      role !== "admin" &&
      task.createdBy._id.toString() !== userId &&
      task.assignedTo?._id?.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this task",
      });
    }

    // Ownership check
    // if (task.createdBy._id.toString() !== req.user.userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Not authorized to view this task",
    //   });
    // }

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
// @desc Update task
// @route PUT /api/tasks/:id
// @access Private
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    // Not found
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const userId = req.user.userId;
    const role = req.user.role;

    // ✅ Fixed Permission
    const isCreator = task.createdBy.toString() === userId;
    const isAssigned = task.assignedTo?.toString() === userId;
    const isAdmin = role === "admin";

    // ❌ No access at all
    if (!isAdmin && !isCreator && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // ================= ROLE-BASED FIELD CONTROL =================

    let allowedFields = [];

    if (isAdmin || isCreator) {
      // ✅ Full access
      allowedFields = [
        "title",
        "description",
        "priority",
        "status",
        "deadline",
        "assignedTo",
      ];
    } else if (isAssigned) {
      // ⚠️ ONLY status update allowed
      allowedFields = ["status"];
    }

    // 🚫 Prevent invalid updates
    const updates = Object.keys(req.body);

    const isValidUpdate = updates.every((field) =>
      allowedFields.includes(field)
    );

    if (!isValidUpdate) {
      return res.status(403).json({
        success: false,
        message: "You can only update allowed fields for this task",
      });
    }

    // 🔥 FIX: Handle assignedTo empty string conversion
    if (req.body.assignedTo !== undefined && (isAdmin || isCreator)) {
      // Convert empty string to null
      let assignedToValue = req.body.assignedTo;
      
      if (assignedToValue === "" || assignedToValue === "null" || assignedToValue === "undefined") {
        assignedToValue = null;
      }
      
      // Only validate if there's an actual user ID
      if (assignedToValue && assignedToValue !== null) {
        const userExists = await User.findById(assignedToValue);
        if (!userExists) {
          return res.status(404).json({
            success: false,
            message: "Assigned user not found",
          });
        }
      }
      
      req.body.assignedTo = assignedToValue;
    }

    // ✅ Apply updates
    updates.forEach((field) => {
      if (field === "assignedTo" && req.body[field] === null) {
        task[field] = null;
      } else {
        task[field] = req.body[field];
      }
    });

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

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

    const task = await Task.findById(id);

    // Not found
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

     const userId = req.user.userId;
    const role = req.user.role;

    if (role !== "admin" && task.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    // Ownership validation
    // if (task.createdBy.toString() !== req.user.userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Not authorized to delete this task",
    //   });
    // }

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
