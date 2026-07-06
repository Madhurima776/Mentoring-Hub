const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    raisedBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
    department:  { type: String, trim: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    priority: {
      type:    String,
      enum:    ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type:    String,
      enum:    ["open", "inprogress", "resolved"],
      default: "open",
    },
    resolution: { type: String, trim: true },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);