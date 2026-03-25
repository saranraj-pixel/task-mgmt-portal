require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 6000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Server running");
});

const serverUp = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running port on ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed", error.message);
    process.exit(1);
  }
};

serverUp();
