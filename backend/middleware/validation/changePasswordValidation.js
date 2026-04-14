const { body } = require("express-validator");

exports.changePasswordValidation = [
  body("oldPassword")
    .isLength({ min: 8 })
    .withMessage("Old password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}\-_=+|;:'",.<>\/~`]).{8,}$/,
    )
    .withMessage(
      "Old password must include uppercase, lowercase, number, and special character",
    ),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}\-_=+|;:'",.<>\/~`]).{8,}$/,
    )
    .withMessage(
      "New password must include uppercase, lowercase, number, and special character",
    ),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required"),
];
