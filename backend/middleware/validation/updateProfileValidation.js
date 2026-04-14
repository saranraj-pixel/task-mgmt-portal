const { body } = require("express-validator");

exports.updateProfileValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 4 })
    .withMessage("Name must be at least 4 characters"),
];
