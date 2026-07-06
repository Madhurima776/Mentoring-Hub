const mongoose = require("mongoose");

const mentorAssignmentSchema = new mongoose.Schema(
  {
    mentor: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    student: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    department: { type: String, trim: true },
    branch:     { type: String, trim: true },
    section:    { type: String, trim: true },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mentorAssignmentSchema.index({ mentor: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("MentorAssignment", mentorAssignmentSchema);