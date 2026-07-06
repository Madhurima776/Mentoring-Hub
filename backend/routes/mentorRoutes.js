const express  = require("express");
const router   = express.Router();
const { protect, authorize, blockFirstLogin } = require("../middleware/authMiddleware");
const {
  getMyStudents,
  getStudentInfo,
  createSession,
  getMySessions,
  askQuestion,
  getMyQuestions,
  updateAttendance,
  raiseIssue,
  generateWeeklyReport,
  getWeeklyReports,
  setOfflineMeetReminder,
} = require("../controllers/mentorController");
const {
  downloadWeeklyReportPDF,
} = require("../controllers/reportController");

// All mentor routes — must be logged in, mentor role, not first login
router.use(protect, authorize("mentor"), blockFirstLogin);

router.get("/students",              getMyStudents);
router.get("/students/:id",          getStudentInfo);

router.post("/sessions",             createSession);
router.get("/sessions",              getMySessions);

router.post("/questions",            askQuestion);
router.get("/questions",             getMyQuestions);

router.put("/attendance",            updateAttendance);

router.post("/issues",               raiseIssue);

router.post("/weekly-report",        generateWeeklyReport);
router.get("/weekly-reports",        getWeeklyReports);
router.get("/weekly-report/:id/pdf", downloadWeeklyReportPDF);

router.post("/reminders",            setOfflineMeetReminder);

module.exports = router;