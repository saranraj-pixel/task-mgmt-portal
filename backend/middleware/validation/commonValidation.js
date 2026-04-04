const { body, validationResult } = require("express-validator");

/* -----------------------------
   Validation Result Middleware
----------------------------- */

exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: errors.array()
    });
  }

  next();
};

/* -----------------------------
   Register Validation
----------------------------- */

exports.registerValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
];

/* -----------------------------
   Create Task Validation
----------------------------- */

exports.createTaskValidation = [

  body("title")
    .notEmpty()
    .withMessage("Title is required"),

  body("priority")
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),

  body("deadline")
    .isISO8601()
    .withMessage("Deadline must be valid date")
    .custom((value) => {

      const deadline = new Date(value);
      const now = new Date();

      if (deadline <= now) {
        throw new Error("Deadline must be a future date");
      }

      return true;
    })

];