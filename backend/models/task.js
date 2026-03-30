const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 500,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },

    deadline: {
      type: Date,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

/* -----------------------------
   Pre-save Hook → update updatedAt
----------------------------- */

taskSchema.pre("save", async function () {
  this.updatedAt = Date.now();
});

/* -----------------------------
   Indexes for faster queries
----------------------------- */

taskSchema.index({ createdBy: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });

/* -----------------------------
   Virtual → isOverdue
----------------------------- */

taskSchema.virtual("isOverdue").get(function () {
  if (!this.deadline) return false;

  return this.deadline < new Date() && this.status !== "done";
});

/* -----------------------------
   Enable virtuals in JSON
----------------------------- */

taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Task", taskSchema);
