const WeeklyReport = require("../models/WeeklyReport");
const User         = require("../models/User");
const { generateWeeklyReportPDF } = require("../utils/generatePDF");

const downloadWeeklyReportPDF = async (req, res) => {
  try {
    const report = await WeeklyReport.findById(req.params.id)
      .populate("lowAttendanceStudents.student", "name rollNo")
      .populate("sessionsSummary.student",       "name rollNo");

    if (!report) {
      return res.status(404).json({ msg: "Report not found" });
    }

    if (
      report.mentor.toString() !== req.user.id &&
      req.user.role !== "coordinator"
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const mentor = await User.findById(report.mentor).select("name department");
    generateWeeklyReportPDF(report, mentor, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { downloadWeeklyReportPDF };