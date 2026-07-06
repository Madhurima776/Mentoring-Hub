const express  = require("express");
const router   = express.Router();
const { protect, authorize, blockFirstLogin } = require("../middleware/authMiddleware");
const {
  getMentors,
  addMentor,
  removeMentor,
  getStudents,
  assignStudent,
  removeAssignment,
  getAssignments,
  assignSubstitute,
  getWeeklyReports,
  getPendingReports,
  getPendingAnswers,
  sendReminderToMentor,
  sendReminderToStudent,
  sendBulkReminders,
  getIssues,
  resolveIssue,
  getStudentCertificates,
} = require("../controllers/coordinatorController");
const { downloadCertificatesPDF } = require("../controllers/certificatePDFController");
const { downloadWeeklyReportPDF } = require("../controllers/reportController");

// All coordinator routes
router.use(protect, authorize("coordinator"), blockFirstLogin);

// Mentors
router.get("/mentors",               getMentors);
router.post("/mentors",              addMentor);
router.delete("/mentors/:id",        removeMentor);

// Students
router.get("/students",              getStudents);

// Assignments
router.get("/assignments",           getAssignments);
router.post("/assign",               assignStudent);
router.delete("/assign/:assignmentId", removeAssignment);

// Leave & Substitution
router.post("/substitute",           assignSubstitute);

// Weekly Reports
router.get("/weekly-reports",        getWeeklyReports);
router.get("/weekly-reports/:id/pdf",downloadWeeklyReportPDF);

// Pending tracking
router.get("/pending-reports",       getPendingReports);
router.get("/pending-answers",       getPendingAnswers);

// Reminders
router.post("/remind-mentor",        sendReminderToMentor);
router.post("/remind-student",       sendReminderToStudent);
router.post("/remind-all-pending",   sendBulkReminders);

// Issues
router.get("/issues",                getIssues);
router.put("/issues/:id/resolve",    resolveIssue);

// Certificates
router.get("/certificates",          getStudentCertificates);
router.get("/certificates/pdf",      downloadCertificatesPDF);

module.exports = router;