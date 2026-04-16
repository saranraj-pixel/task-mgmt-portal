const { body } = require("express-validator");

exports.updateTaskValidation = [
  body("title").optional().trim().notEmpty().withMessage("Title is required"),

  body("status")
    .optional()
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Status must be todo, in progress, or done"),

  body("deadline")
    .optional()
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
