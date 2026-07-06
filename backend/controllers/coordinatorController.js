const User             = require("../models/User");
const MentorAssignment = require("../models/MentorAssignment");
const WeeklyReport     = require("../models/WeeklyReport");
const Reminder         = require("../models/Reminder");
const Issue            = require("../models/Issue");
const Question         = require("../models/Question");

// ─── Get All Mentors in Department ───────────────────────
// GET /coordinator/mentors
const getMentors = async (req, res) => {
  try {
    const mentors = await User.find({
      role:       "mentor",
      department: req.user.department,
      isActive:   true,
    }).select("-password");

    res.json(mentors);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Add Mentor to Department ─────────────────────────────
// POST /coordinator/mentors
const addMentor = async (req, res) => {
  try {
    const { name, email, branch, section, employeeId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ msg: "Name and email are required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const mentor = await User.create({
      name,
      email:        email.toLowerCase().trim(),
      password:     employeeId || "Welcome@123",
      role:         "mentor",
      department:   req.user.department,
      branch:       branch     || "",
      section:      section    || "",
      employeeId:   employeeId || "",
      isFirstLogin: true,
      isActive:     true,
    });

    res.status(201).json({
      msg:    "Mentor added successfully",
      mentor: {
        id:    mentor._id,
        name:  mentor.name,
        email: mentor.email,
        role:  mentor.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Remove Mentor from Department ───────────────────────
// DELETE /coordinator/mentors/:id
const removeMentor = async (req, res) => {
  try {
    const mentor = await User.findOne({
      _id:        req.params.id,
      role:       "mentor",
      department: req.user.department,
    });

    if (!mentor) {
      return res.status(404).json({ msg: "Mentor not found in your department" });
    }

    // Deactivate instead of delete to keep history
    mentor.isActive = false;
    await mentor.save();

    // Deactivate all their assignments
    await MentorAssignment.updateMany(
      { mentor: req.params.id },
      { isActive: false }
    );

    res.json({ msg: "Mentor removed from department" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Get All Students in Department ──────────────────────
// GET /coordinator/students
const getStudents = async (req, res) => {
  try {
    const { branch, section, search } = req.query;

    const filter = {
      role:       "student",
      department: req.user.department,
      isActive:   true,
    };

    if (branch)  filter.branch  = branch;
    if (section) filter.section = section;
    if (search) {
      filter.$or = [
        { name:   { $regex: search, $options: "i" } },
        { email:  { $regex: search, $options: "i" } },
        { rollNo: { $regex: search, $options: "i" } },
      ];
    }

    const students = await User.find(filter).select("-password");
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Assign Student to Mentor ─────────────────────────────
// POST /coordinator/assign
const assignStudent = async (req, res) => {
  try {
    const { mentorId, studentId } = req.body;

    if (!mentorId || !studentId) {
      return res.status(400).json({ msg: "Mentor and student are required" });
    }

    // Verify mentor is in same department
    const mentor = await User.findOne({
      _id:        mentorId,
      role:       "mentor",
      department: req.user.department,
      isActive:   true,
    });
    if (!mentor) {
      return res.status(404).json({ msg: "Mentor not found in your department" });
    }

    // Verify student is in same department
    const student = await User.findOne({
      _id:        studentId,
      role:       "student",
      department: req.user.department,
      isActive:   true,
    });
    if (!student) {
      return res.status(404).json({ msg: "Student not found in your department" });
    }

    // Check if already assigned
    const existing = await MentorAssignment.findOne({
      mentor:   mentorId,
      student:  studentId,
      isActive: true,
    });
    if (existing) {
      return res.status(400).json({ msg: "Student already assigned to this mentor" });
    }

    // Remove any previous assignment for this student
    await MentorAssignment.updateMany(
      { student: studentId, isActive: true },
      { isActive: false }
    );

    const assignment = await MentorAssignment.create({
      mentor:     mentorId,
      student:    studentId,
      department: req.user.department,
      branch:     student.branch,
      section:    student.section,
      assignedBy: req.user.id,
    });

    res.status(201).json({ msg: "Student assigned to mentor", assignment });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Remove Student from Mentor ───────────────────────────
// DELETE /coordinator/assign/:assignmentId
const removeAssignment = async (req, res) => {
  try {
    const assignment = await MentorAssignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ msg: "Assignment not found" });
    }

    assignment.isActive = false;
    await assignment.save();

    res.json({ msg: "Student removed from mentor" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Get All Assignments ──────────────────────────────────
// GET /coordinator/assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await MentorAssignment.find({
      department: req.user.department,
      isActive:   true,
    })
      .populate("mentor",  "name employeeId branch")
      .populate("student", "name rollNo branch section")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Assign Substitute Mentor (Leave) ────────────────────
// POST /coordinator/substitute
const assignSubstitute = async (req, res) => {
  try {
    const {
      mentorOnLeaveId,
      substituteMentorId,
      weekStartDate,
      weekEndDate,
      reason,
    } = req.body;

    if (!mentorOnLeaveId || !substituteMentorId || !weekStartDate || !weekEndDate) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Get all students of mentor on leave
    const assignments = await MentorAssignment.find({
      mentor:   mentorOnLeaveId,
      isActive: true,
    });

    if (!assignments.length) {
      return res.status(400).json({ msg: "Mentor has no assigned students" });
    }

    // Temporarily assign students to substitute
    const tempAssignments = await Promise.all(
      assignments.map((a) =>
        MentorAssignment.create({
          mentor:     substituteMentorId,
          student:    a.student,
          department: req.user.department,
          branch:     a.branch,
          section:    a.section,
          assignedBy: req.user.id,
          isActive:   true,
        }).catch(() => null) // skip if already assigned
      )
    );

    // Send reminder to affected students
    await Promise.all(
      assignments.map((a) =>
        Reminder.create({
          sentBy:        req.user.id,
          recipient:     a.student,
          recipientRole: "student",
          type:          "general",
          message:       `Your mentor is on leave from ${new Date(weekStartDate).toDateString()} to ${new Date(weekEndDate).toDateString()}. A substitute mentor has been assigned.`,
        })
      )
    );

    res.status(201).json({
      msg:      "Substitute assigned and students notified",
      assigned: tempAssignments.filter(Boolean).length,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Get Weekly Reports of All Mentors ───────────────────
// GET /coordinator/weekly-reports
const getWeeklyReports = async (req, res) => {
  try {
    const { weekStartDate } = req.query;
    const filter = { department: req.user.department };

    if (weekStartDate) filter.weekStartDate = new Date(weekStartDate);

    const reports = await WeeklyReport.find(filter)
      .populate("mentor",                        "name employeeId")
      .populate("lowAttendanceStudents.student", "name rollNo branch section")
      .populate("sessionsSummary.student",       "name rollNo")
      .sort({ weekStartDate: -1 });

    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Check Who Hasn't Submitted Weekly Report ────────────
// GET /coordinator/pending-reports
const getPendingReports = async (req, res) => {
  try {
    const { weekStartDate } = req.query;

    if (!weekStartDate) {
      return res.status(400).json({ msg: "weekStartDate is required" });
    }

    // All mentors in department
    const allMentors = await User.find({
      role:       "mentor",
      department: req.user.department,
      isActive:   true,
    }).select("name email employeeId");

    // Mentors who submitted
    const submitted = await WeeklyReport.find({
      department:    req.user.department,
      weekStartDate: new Date(weekStartDate),
      isSubmitted:   true,
    }).select("mentor");

    const submittedIds = submitted.map((r) => r.mentor.toString());

    // Mentors who didn't submit
    const pending = allMentors.filter(
      (m) => !submittedIds.includes(m._id.toString())
    );

    res.json({
      total:     allMentors.length,
      submitted: submittedIds.length,
      pending:   pending.length,
      pendingMentors: pending,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Check Who Hasn't Answered Questions ─────────────────
// GET /coordinator/pending-answers
const getPendingAnswers = async (req, res) => {
  try {
    const unanswered = await Question.find({
      isAnswered: false,
    })
      .populate("student", "name rollNo department")
      .populate("mentor",  "name")
      .sort({ createdAt: -1 });

    // Filter by department
    const filtered = unanswered.filter(
      (q) => q.student?.department === req.user.department
    );

    res.json({
      total:    filtered.length,
      questions: filtered,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Send Reminder to Mentor ──────────────────────────────
// POST /coordinator/remind-mentor
const sendReminderToMentor = async (req, res) => {
  try {
    const { mentorId, type, message } = req.body;

    if (!mentorId) {
      return res.status(400).json({ msg: "Mentor ID is required" });
    }

    const reminder = await Reminder.create({
      sentBy:        req.user.id,
      recipient:     mentorId,
      recipientRole: "mentor",
      type:          type    || "weekly_report_pending",
      message:       message || "Please submit your weekly report.",
    });

    res.status(201).json({ msg: "Reminder sent to mentor", reminder });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Send Reminder to Student ─────────────────────────────
// POST /coordinator/remind-student
const sendReminderToStudent = async (req, res) => {
  try {
    const { studentId, type, message } = req.body;

    if (!studentId) {
      return res.status(400).json({ msg: "Student ID is required" });
    }

    const reminder = await Reminder.create({
      sentBy:        req.user.id,
      recipient:     studentId,
      recipientRole: "student",
      type:          type    || "question_unanswered",
      message:       message || "Please answer the pending questions from your mentor.",
    });

    res.status(201).json({ msg: "Reminder sent to student", reminder });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Send Bulk Reminders to All Pending ───────────────────
// POST /coordinator/remind-all-pending
const sendBulkReminders = async (req, res) => {
  try {
    const { weekStartDate } = req.body;

    if (!weekStartDate) {
      return res.status(400).json({ msg: "weekStartDate is required" });
    }

    // Get pending mentors
    const allMentors  = await User.find({
      role:       "mentor",
      department: req.user.department,
      isActive:   true,
    });

    const submitted = await WeeklyReport.find({
      department:    req.user.department,
      weekStartDate: new Date(weekStartDate),
      isSubmitted:   true,
    }).select("mentor");

    const submittedIds   = submitted.map((r) => r.mentor.toString());
    const pendingMentors = allMentors.filter(
      (m) => !submittedIds.includes(m._id.toString())
    );

    // Get students with unanswered questions
    const unanswered = await Question.find({ isAnswered: false })
      .populate("student", "department");

    const pendingStudentIds = [
      ...new Set(
        unanswered
          .filter((q) => q.student?.department === req.user.department)
          .map((q) => q.student._id.toString())
      ),
    ];

    // Send reminders to pending mentors
    await Promise.all(
      pendingMentors.map((m) =>
        Reminder.create({
          sentBy:        req.user.id,
          recipient:     m._id,
          recipientRole: "mentor",
          type:          "weekly_report_pending",
          message:       "Reminder: Please submit your weekly mentoring report.",
        })
      )
    );

    // Send reminders to pending students
    await Promise.all(
      pendingStudentIds.map((sid) =>
        Reminder.create({
          sentBy:        req.user.id,
          recipient:     sid,
          recipientRole: "student",
          type:          "question_unanswered",
          message:       "Reminder: Please answer the pending questions from your mentor.",
        })
      )
    );

    res.status(201).json({
      msg:              "Bulk reminders sent",
      mentorsReminded:  pendingMentors.length,
      studentsReminded: pendingStudentIds.length,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Get All Issues in Department ────────────────────────
// GET /coordinator/issues
const getIssues = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { department: req.user.department };
    if (status) filter.status = status;

    const issues = await Issue.find(filter)
      .populate("raisedBy", "name role")
      .populate("student",  "name rollNo")
      .populate("resolvedBy", "name")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Resolve an Issue ─────────────────────────────────────
// PUT /coordinator/issues/:id/resolve
const resolveIssue = async (req, res) => {
  try {
    const { resolution } = req.body;

    if (!resolution) {
      return res.status(400).json({ msg: "Resolution is required" });
    }

    const issue = await Issue.findOneAndUpdate(
      {
        _id:        req.params.id,
        department: req.user.department,
      },
      {
        status:     "resolved",
        resolution,
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
      },
      { new: true }
    );

    if (!issue) return res.status(404).json({ msg: "Issue not found" });

    res.json({ msg: "Issue resolved", issue });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Download All Student Certificates (Monthly) ─────────
// GET /coordinator/certificates?month=May 2026
const getStudentCertificates = async (req, res) => {
  try {
    const { month } = req.query;

    const students = await User.find({
      role:       "student",
      department: req.user.department,
      isActive:   true,
    }).select("name rollNo branch section certifications");

    // Filter certifications by month if provided
    const result = students
      .map((s) => ({
        studentId:   s._id,
        name:        s.name,
        rollNo:      s.rollNo,
        branch:      s.branch,
        section:     s.section,
        certifications: month
          ? s.certifications.filter((c) => c.uploadedMonth === month)
          : s.certifications,
      }))
      .filter((s) => s.certifications.length > 0);

    res.json({
      month:   month || "All",
      total:   result.reduce((acc, s) => acc + s.certifications.length, 0),
      students: result,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
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
};