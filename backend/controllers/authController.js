const User = require("../models/user");
const jwt = require("jsonwebtoken");

// @desc Register User
// @route POST /api/auth/register
// @access Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role} = req.body;

    // ✅ Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // ✅ Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // ✅ Create user
    const user = await User.create({ name, email, password, role });

    // ✅ Response (NO PASSWORD)
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc Login User
// @route POST /api/auth/login
// @access Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // ✅ Get user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role || "user" }, // role optional
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: user.getProfile(),
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc Logout User
// @route POST /api/auth/logout
// @access Public (or Protected - your choice)
exports.logoutUser = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
      note: "Client should remove the token (JWT is stateless)",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
