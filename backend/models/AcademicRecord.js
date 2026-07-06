const mongoose = require("mongoose");

const academicRecordSchema = new mongoose.Schema(
  {
    student: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    semester: { type: Number, required: true },
    subject:  { type: String, required: true, trim: true },
    midExamMarks: {
      obtained: { type: Number, default: 0 },
      total:    { type: Number, default: 30 },
    },
    semExamMarks: {
      obtained: { type: Number, default: 0 },
      total:    { type: Number, default: 70 },
    },
    attendancePercent:   { type: Number, default: 0 },
    lowAttendanceReason: { type: String, trim: true },
  },
  { timestamps: true }
);

academicRecordSchema.index(
  { student: 1, semester: 1, subject: 1 },
  { unique: true }
);

module.exports = mongoose.model("AcademicRecord", academicRecordSchema);