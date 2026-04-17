const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    logger.error("❌ MONGO_URI is not defined in .env");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // fail fast if DB not reachable
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("❌ MongoDB Connection Error", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// 🔁 MongoDB Connection Events
mongoose.connection.on("connected", () => {
  logger.info("🟢 Mongoose connected");
});

mongoose.connection.on("error", (err) => {
  logger.error("🔴 Mongoose connection error", {
    message: err.message,
    stack: err.stack,
  });
});

mongoose.connection.on("disconnected", () => {
  logger.warn("🟡 Mongoose disconnected");
});

// 🛑 Graceful Shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    logger.info("🛑 MongoDB connection closed due to app termination");
    process.exit(0);
  } catch (error) {
    logger.error("Error during MongoDB shutdown", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
});

module.exports = connectDB;
