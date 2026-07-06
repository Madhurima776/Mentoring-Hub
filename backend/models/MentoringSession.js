const mongoose = require("mongoose");

const mentoringSessionSchema = new mongoose.Schema(
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
    date: { type: Date, required: true },
    type: {
      type:    String,
      enum:    ["individual", "group", "online", "offline"],
      default: "individual",
    },
    purpose:          { type: String, trim: true },
    outcome:          { type: String, trim: true },
    notes:            { type: String, trim: true },
    attendanceStatus: {
      type:    String,
      enum:    ["present", "absent"],
      default: "present",
    },
    absentReason:     { type: String, trim: true },
    nextFollowUpDate: { type: Date },
    isSubmitted:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentoringSession", mentoringSessionSchema);