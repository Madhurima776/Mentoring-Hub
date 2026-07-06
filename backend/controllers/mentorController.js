const MentorAssignment  = require("../models/MentorAssignment");
const MentoringSession  = require("../models/MentoringSession");
const AcademicRecord    = require("../models/AcademicRecord");
const Question          = require("../models/Question");
const WeeklyReport      = require("../models/WeeklyReport");
const Reminder          = require("../models/Reminder");
const Issue             = require("../models/Issue");
const User              = require("../models/User");

// ─── Get My Assigned Students ─────────────────────────────
// GET /mentor/students
const getMyStudents = async (req, res) => {
  try {
    const assignments = await MentorAssignment.find({
      mentor:   req.user.id,
      isActive: true,
    }).populate("student", "-password");

    const students = assignments.map((a) => a.student);
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Get Single Student Info ──────────────────────────────
// GET /mentor/students/:id
const getStudentInfo = async (req, res) => {
  try {
    // Verify this student is assigned to this mentor
    const assignment = await MentorAssignment.findOne({
      mentor:   req.user.id,
      student:  req.params.id,
      isActive: true,
    });

    if (!assignment) {
      return res.status(403).json({ msg: "This student is not assigned to you" });
    }

    const student = await User.findById(req.params.id).select("-password");
    if (!student) return res.status(404).json({ msg: "Student not found" });

    const academicRecords = await AcademicRecord.find({ student: req.params.id });
    const sessions        = await MentoringSession.find({
      mentor:  req.user.id,
      student: req.params.id,
    }).sort({ date: -1 });

    const questions = await Question.find({
      mentor:  req.user.id,
      student: req.params.id,
    }).sort({ createdAt: -1 });

    res.json({ student, academicRecords, sessions, questions });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Record Mentoring Session ─────────────────────────────
// POST /mentor/sessions
const createSession = async (req, res) => {
  try {
    const {
      studentId, date, type,
      purpose, outcome, notes,
      attendanceStatus, absentReason,
      nextFollowUpDate,
    } = req.body;

    if (!studentId || !date || !purpose) {
      return res.status(400).json({ msg: "Student, date and purpose are required" });
    }

    // Verify assignment
    const assignment = await MentorAssignment.findOne({
      mentor:   req.user.id,
      student:  studentId,
      isActive: true,
    });
    if (!assignment) {
      return res.status(403).json({ msg: "This student is not assigned to you" });
    }

    const session = await MentoringSession.create({
      mentor:           req.user.id,
      student:          studentId,
      date,
      type:             type             || "individual",
      purpose,
      outcome:          outcome          || "",
      notes:            notes            || "",
      attendanceStatus: attendanceStatus || "present",
      absentReason:     absentReason     || "",
      nextFollowUpDate: nextFollowUpDate || null,
      isSubmitted:      true,
    });

    res.status(201).json({ msg: "Session recorded successfully", session });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Get All My Sessions ──────────────────────────────────
// GET /mentor/sessions
const getMySessions = async (req, res) => {
  try {
    const { studentId, from, to } = req.query;
    const filter = { mentor: req.user.id };

    if (studentId) filter.student = studentId;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(to);
    }

    const sessions = await MentoringSession.find(filter)
      .populate("student", "name rollNo branch section")
      .sort({ date: -1 });

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Ask Question to Student ──────────────────────────────
// POST /mentor/questions
const askQuestion = async (req, res) => {
  try {
    const { studentId, category, question, weekStartDate } = req.body;

    if (!studentId || !question) {
      return res.status(400).json({ msg: "Student and question are required" });
    }

    // Verify assignment
    const assignment = await MentorAssignment.findOne({
      mentor:   req.user.id,
      student:  studentId,
      isActive: true,
    });
    if (!assignment) {
      return res.status(403).json({ msg: "This student is not assigned to you" });
    }

    const newQuestion = await Question.create({
      mentor:        req.user.id,
      student:       studentId,
      category:      category      || "general",
      question,
      weekStartDate: weekStartDate || new Date(),
    });

    res.status(201).json({ msg: "Question sent to student", question: newQuestion });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Get My Questions ─────────────────────────────────────
// GET /mentor/questions
const getMyQuestions = async (req, res) => {
  try {
    const { studentId, isAnswered } = req.query;
    const filter = { mentor: req.user.id };

    if (studentId)             filter.student    = studentId;
    if (isAnswered !== undefined) filter.isAnswered = isAnswered === "true";

    const questions = await Question.find(filter)
      .populate("student", "name rollNo")
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Update Attendance Percent ────────────────────────────
// PUT /mentor/attendance
const updateAttendance = async (req, res) => {
  try {
    const { studentId, semester, subject, attendancePercent } = req.body;

    if (!studentId || !semester || !subject || attendancePercent === undefined) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const record = await AcademicRecord.findOneAndUpdate(
      { student: studentId, semester, subject },
      { attendancePercent },
      { new: true, upsert: true }
    );

    res.json({ msg: "Attendance updated", record });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Raise an Issue ───────────────────────────────────────
// POST /mentor/issues
const raiseIssue = async (req, res) => {
  try {
    const { studentId, title, description, priority } = req.body;

    if (!studentId || !title) {
      return res.status(400).json({ msg: "Student and title are required" });
    }

    // Find coordinator of same department
    const coordinator = await User.findOne({
      role:       "coordinator",
      department: req.user.department,
      isActive:   true,
    });

    const issue = await Issue.create({
      raisedBy:   req.user.id,
      student:    studentId,
      assignedTo: coordinator?._id || null,
      department: req.user.department,
      title,
      description: description || "",
      priority:    priority    || "medium",
    });

    res.status(201).json({ msg: "Issue raised successfully", issue });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Generate Weekly Report ───────────────────────────────
// POST /mentor/weekly-report
const generateWeeklyReport = async (req, res) => {
  try {
    const { weekStartDate, weekEndDate } = req.body;

    if (!weekStartDate || !weekEndDate) {
      return res.status(400).json({ msg: "Week start and end dates are required" });
    }

    const start = new Date(weekStartDate);
    const end   = new Date(weekEndDate);

    // Get all assigned students
    const assignments = await MentorAssignment.find({
      mentor:   req.user.id,
      isActive: true,
    });
    const studentIds = assignments.map((a) => a.student);

    // Get sessions for this week
    const sessions = await MentoringSession.find({
      mentor: req.user.id,
      date:   { $gte: start, $lte: end },
    }).populate("student", "name rollNo");

    // Calculate attendance stats
    const presentCount = sessions.filter(
      (s) => s.attendanceStatus === "present"
    ).length;
    const absentCount = sessions.filter(
      (s) => s.attendanceStatus === "absent"
    ).length;

    // Get low attendance students (below 75%)
    const academicRecords = await AcademicRecord.find({
      student: { $in: studentIds },
      attendancePercent: { $lt: 75 },
    }).populate("student", "name rollNo branch section");

    // Group low attendance by student
    const lowAttendanceMap = {};
    academicRecords.forEach((r) => {
      const sid = r.student._id.toString();
      if (!lowAttendanceMap[sid]) {
        lowAttendanceMap[sid] = {
          student:           r.student._id,
          attendancePercent: r.attendancePercent,
          reason:            r.lowAttendanceReason || "Not provided",
        };
      }
    });

    const lowAttendanceStudents = Object.values(lowAttendanceMap);

    // Sessions summary
    const sessionsSummary = sessions.map((s) => ({
      student: s.student._id,
      purpose: s.purpose,
      outcome: s.outcome,
    }));

    // Save or update report
    const report = await WeeklyReport.findOneAndUpdate(
      { mentor: req.user.id, weekStartDate: start },
      {
        mentor:                req.user.id,
        department:            req.user.department,
        weekStartDate:         start,
        weekEndDate:           end,
        totalStudents:         studentIds.length,
        presentCount,
        absentCount,
        lowAttendanceCount:    lowAttendanceStudents.length,
        lowAttendanceStudents,
        sessionsSummary,
        isSubmitted:           true,
        submittedAt:           new Date(),
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ msg: "Weekly report generated", report });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Get My Weekly Reports ────────────────────────────────
// GET /mentor/weekly-reports
const getWeeklyReports = async (req, res) => {
  try {
    const reports = await WeeklyReport.find({ mentor: req.user.id })
      .populate("lowAttendanceStudents.student", "name rollNo")
      .populate("sessionsSummary.student",       "name rollNo")
      .sort({ weekStartDate: -1 });

    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Set Offline Meet Reminder ────────────────────────────
// POST /mentor/reminders
const setOfflineMeetReminder = async (req, res) => {
  try {
    const { message } = req.body;

    // Get all assigned students
    const assignments = await MentorAssignment.find({
      mentor:   req.user.id,
      isActive: true,
    });

    if (!assignments.length) {
      return res.status(400).json({ msg: "No students assigned to you" });
    }

    // Send reminder to all assigned students
    const reminders = await Promise.all(
      assignments.map((a) =>
        Reminder.create({
          sentBy:        req.user.id,
          recipient:     a.student,
          recipientRole: "student",
          type:          "offline_meet",
          message:       message || "Your mentor has scheduled an offline meet. Please attend.",
        })
      )
    );

    res.status(201).json({
      msg:   `Reminder sent to ${reminders.length} students`,
      count: reminders.length,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
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
};