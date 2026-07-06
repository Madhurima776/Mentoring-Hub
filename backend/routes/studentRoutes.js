const express  = require("express");
const router   = express.Router();
const { protect, authorize, blockFirstLogin } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  addAward,
  deleteAward,
  addCertification,
  deleteCertification,
  upsertAcademicRecord,
  getAcademicRecords,
  getMyQuestions,
  answerQuestion,
  getMyReminders,
  markReminderRead,
  getMyMentor,
} = require("../controllers/studentController");

// All student routes — must be logged in, student role, not first login
router.use(protect, authorize("student"), blockFirstLogin);

// Profile
router.get("/profile",                    getProfile);
router.put("/profile",                    updateProfile);

// Awards
router.post("/awards",                    addAward);
router.delete("/awards/:awardId",         deleteAward);

// Certifications
router.post("/certifications",            addCertification);
router.delete("/certifications/:certId",  deleteCertification);

// Academic Records
router.post("/academic",                  upsertAcademicRecord);
router.get("/academic",                   getAcademicRecords);

// Questions from mentor
router.get("/questions",                  getMyQuestions);
router.put("/questions/:id/answer",       answerQuestion);

// Reminders
router.get("/reminders",                  getMyReminders);
router.put("/reminders/:id/read",         markReminderRead);

// Mentor info
router.get("/mentor",                     getMyMentor);

module.exports = router;