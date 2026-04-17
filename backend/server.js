require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoute");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 6000;

const app = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL, // Vite dev
  process.env.PRODUCTION_CLIENT_URL, // production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // if using cookies / tokens
  }),
);

app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Server running");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Global error handler
app.use(errorHandler);

const serverUp = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server running port on ${PORT}`);
    });
  } catch (error) {
    logger.error("Server failed", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

serverUp();
