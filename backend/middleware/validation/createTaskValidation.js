const { body } = require("express-validator");

exports.createTaskValidation = [
  body("title").notEmpty().withMessage("Title is required"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 200 })
    .withMessage("Description must be between 10 and 200 characters")
    .trim(),

  body("priority")
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),

  body("status")
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Status must be todo, in progress, or done"),

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
    }),
];
