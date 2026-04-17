const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info", // default log level
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }), // log stack trace
    format.json(),
  ),
  defaultMeta: { service: "task-manager-api" },
  transports: [
    new transports.Console(),

    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

module.exports = logger;
