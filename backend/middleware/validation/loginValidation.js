const { body } = require("express-validator");

exports.loginValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}\-_=+|;:'",.<>\/~`]).{8,}$/,
    )
    .withMessage(
      "password must include uppercase, lowercase, number, and special character",
    ),
];
