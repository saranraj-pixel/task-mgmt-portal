// controllers/adminController.js
const User = require("../models/user");
const Task = require("../models/task");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Invitation = require("../models/invitation");
const sendEmail = require("../utils/sendEmail");



exports.getAdminDashboard = async (req, res) => {
  try {
    /* -----------------------------
       1. Total counts
    ----------------------------- */
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();

    /* -----------------------------
       2. Tasks by Status
    ----------------------------- */
    const tasksByStatus = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    /* -----------------------------
       3. Tasks by Priority
    ----------------------------- */
    const tasksByPriority = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    /* -----------------------------
       4. Users with Task Counts
    ----------------------------- */
    const usersWithTasks = await User.aggregate([
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "assignedTo",
          as: "tasks",
        },
      },
      {
        $addFields: {
          totalTasks: { $size: "$tasks" },
          completedTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: { $eq: ["$$task.status", "done"] },
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          totalTasks: 1,
          completedTasks: 1,
        },
      },
    ]);

    /* -----------------------------
       5. Recent Users
    ----------------------------- */
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");

    /* -----------------------------
       6. Recent Tasks (with user info)
    ----------------------------- */
    const recentTasks = await Task.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    /* -----------------------------
       Final Response
    ----------------------------- */
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTasks,
        tasksByStatus,
        tasksByPriority,
        usersWithTasks,
        recentUsers,
        recentTasks,
      },
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};

// 🔐 Generate token (same structure as user login)
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// 🔑 ADMIN LOGIN ONLY
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    // ✅ Find user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ✅ Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔥 CRITICAL: Only allow admins
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied (Admin only)",
      });
    }

    // ✅ Generate token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      data: user.getProfile(),
    });

  } catch (error) {
    console.error("Admin Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.inviteUser = async (req, res) => {
  try {
    const { email } = req.body;

    const token = crypto.randomBytes(32).toString("hex");

    const invitation = await Invitation.create({
      email,
      token,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
      createdBy: req.user.id || req.user.userId || req.user._id,
    });

    const inviteLink = `${process.env.CLIENT_URL}/register?token=${token}`;

    // send email (nodemailer or service like SES/SendGrid)
    await sendEmail(email, "You're invited", inviteLink);

    res.json({ message: "Invitation sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Already used" });
    }

    if (invitation.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Expired invitation" });
    }

    res.json({ email: invitation.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerWithInvite = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Already used" });
    }

    const user = await User.create({
      name,
      email: invitation.email,
      password, // hash before save
      role: "user",
    });

    invitation.status = "accepted";
    await invitation.save();

    res.json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
