const mongoose = require("mongoose");

const weeklyReportSchema = new mongoose.Schema(
  {
    mentor: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    department:    { type: String, trim: true },
    weekStartDate: { type: Date, required: true },
    weekEndDate:   { type: Date, required: true },

    totalStudents:      { type: Number, default: 0 },
    presentCount:       { type: Number, default: 0 },
    absentCount:        { type: Number, default: 0 },
    lowAttendanceCount: { type: Number, default: 0 },

    lowAttendanceStudents: [
      {
        student:           { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        attendancePercent: { type: Number },
        reason:            { type: String },
      },
    ],

    sessionsSummary: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        purpose: { type: String },
        outcome: { type: String },
      },
    ],

    isSubmitted: { type: Boolean, default: false },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

weeklyReportSchema.index(
  { mentor: 1, weekStartDate: 1 },
  { unique: true }
);

module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);