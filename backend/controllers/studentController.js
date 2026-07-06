const User            = require("../models/User");
const AcademicRecord  = require("../models/AcademicRecord");
const Question        = require("../models/Question");
const Reminder        = require("../models/Reminder");
const MentorAssignment = require("../models/MentorAssignment");

// ─── Get My Profile ───────────────────────────────────────
// GET /student/profile
const getProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select("-password");
    if (!student) return res.status(404).json({ msg: "Student not found" });
    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Update Profile ───────────────────────────────────────
// PUT /student/profile
// name and email CANNOT be updated
const updateProfile = async (req, res) => {
  try {
    const {
      personalInfo,
      extraCurricular,
    } = req.body;

    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // Update only allowed fields
    if (personalInfo)    student.personalInfo    = { ...student.personalInfo, ...personalInfo };
    if (extraCurricular) student.extraCurricular = extraCurricular;

    await student.save();
    res.json({ msg: "Profile updated successfully", student });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Add Award / Hackathon ────────────────────────────────
// POST /student/awards
const addAward = async (req, res) => {
  try {
    const { title, description, type } = req.body;

    if (!title) return res.status(400).json({ msg: "Title is required" });

    const student = await User.findById(req.user.id);

    const month = new Date().toLocaleString("default", {
      month: "long",
      year:  "numeric",
    }); // e.g. "May 2026"

    student.awards.push({ title, description, type: type || "other", month });
    await student.save();

    res.status(201).json({ msg: "Award added successfully", awards: student.awards });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Delete Award ─────────────────────────────────────────
// DELETE /student/awards/:awardId
const deleteAward = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    student.awards = student.awards.filter(
      (a) => a._id.toString() !== req.params.awardId
    );
    await student.save();
    res.json({ msg: "Award removed", awards: student.awards });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Add Certification ────────────────────────────────────
// POST /student/certifications
const addCertification = async (req, res) => {
  try {
    const { title, issuedBy, issuedDate, description } = req.body;

    if (!title) return res.status(400).json({ msg: "Title is required" });

    const student = await User.findById(req.user.id);

    const uploadedMonth = new Date().toLocaleString("default", {
      month: "long",
      year:  "numeric",
    });

    student.certifications.push({
      title,
      issuedBy:      issuedBy    || "",
      issuedDate:    issuedDate  || null,
      description:   description || "",
      uploadedMonth,
    });

    await student.save();
    res.status(201).json({
      msg:            "Certification added",
      certifications: student.certifications,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Delete Certification ─────────────────────────────────
// DELETE /student/certifications/:certId
const deleteCertification = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    student.certifications = student.certifications.filter(
      (c) => c._id.toString() !== req.params.certId
    );
    await student.save();
    res.json({ msg: "Certification removed", certifications: student.certifications });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Add / Update Academic Marks ──────────────────────────
// POST /student/academic
const upsertAcademicRecord = async (req, res) => {
  try {
    const {
      semester, subject,
      midExamMarks, semExamMarks,
    } = req.body;

    if (!semester || !subject) {
      return res.status(400).json({ msg: "Semester and subject are required" });
    }

    const record = await AcademicRecord.findOneAndUpdate(
      { student: req.user.id, semester, subject },
      {
        student: req.user.id,
        semester,
        subject,
        ...(midExamMarks && { midExamMarks }),
        ...(semExamMarks && { semExamMarks }),
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ msg: "Marks saved successfully", record });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Get My Academic Records ──────────────────────────────
// GET /student/academic
const getAcademicRecords = async (req, res) => {
  try {
    const { semester } = req.query;
    const filter = { student: req.user.id };
    if (semester) filter.semester = Number(semester);

    const records = await AcademicRecord.find(filter).sort({ semester: 1, subject: 1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Get Questions From Mentor ────────────────────────────
// GET /student/questions
const getMyQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ student: req.user.id })
      .populate("mentor", "name employeeId department")
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Answer a Question ────────────────────────────────────
// PUT /student/questions/:id/answer
const answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer) return res.status(400).json({ msg: "Answer is required" });

    const question = await Question.findOne({
      _id:     req.params.id,
      student: req.user.id,
    });

    if (!question) {
      return res.status(404).json({ msg: "Question not found" });
    }

    if (question.isAnswered) {
      return res.status(400).json({ msg: "Question already answered" });
    }

    question.answer     = answer;
    question.isAnswered = true;
    question.answeredAt = new Date();
    await question.save();

    res.json({ msg: "Answer submitted successfully", question });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Get My Reminders ─────────────────────────────────────
// GET /student/reminders
const getMyReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ recipient: req.user.id })
      .populate("sentBy", "name")
      .sort({ createdAt: -1 });

    res.json(reminders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Mark Reminder as Read ────────────────────────────────
// PUT /student/reminders/:id/read
const markReminderRead = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!reminder) return res.status(404).json({ msg: "Reminder not found" });

    res.json({ msg: "Marked as read", reminder });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── Get My Assigned Mentor ───────────────────────────────
// GET /student/mentor
const getMyMentor = async (req, res) => {
  try {
    const assignment = await MentorAssignment.findOne({
      student:  req.user.id,
      isActive: true,
    }).populate("mentor", "-password");

    if (!assignment) {
      return res.status(404).json({ msg: "No mentor assigned yet" });
    }

    res.json(assignment.mentor);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
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
};