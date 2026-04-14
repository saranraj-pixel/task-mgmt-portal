const { param } = require("express-validator");

exports.idValidation = [
  param("id")
    .notEmpty()
    .withMessage("Task ID is required")
    .isMongoId()
    .withMessage("Invalid Task ID"),
];
