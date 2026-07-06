const User      = require("../models/User");
const parseFile = require("../utils/parseFile");
const fs        = require("fs");

// POST /admin/upload-users
const bulkUploadUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "Please upload a CSV or Excel file" });
    }

    const rows = await parseFile(req.file.path);
    fs.unlinkSync(req.file.path);

    if (!rows.length) {
      return res.status(400).json({ msg: "File is empty" });
    }

    const results = { created: [], skipped: [], failed: [] };

    for (const row of rows) {
      try {
        const {
          name, email, role, department,
          branch, section, semester, batch,
          rollNo, employeeId,
        } = row;

        if (!name || !email || !role) {
          results.failed.push({ row, reason: "Missing name, email or role" });
          continue;
        }

        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) {
          results.skipped.push({ email, reason: "Email already exists" });
          continue;
        }

        const defaultPassword = rollNo || employeeId || "Welcome@123";

        await User.create({
          name:         name.trim(),
          email:        email.toLowerCase().trim(),
          password:     defaultPassword,
          role:         role.toLowerCase().trim(),
          department:   department || "",
          branch:       branch     || "",
          section:      section    || "",
          semester:     semester   ? Number(semester) : undefined,
          batch:        batch      || "",
          rollNo:       rollNo     || "",
          employeeId:   employeeId || "",
          isFirstLogin: true,
        });

        results.created.push(email);
      } catch (err) {
        results.failed.push({ row, reason: err.message });
      }
    }

    res.status(201).json({
      msg:     "Bulk upload complete",
      created: results.created.length,
      skipped: results.skipped.length,
      failed:  results.failed.length,
      details: results,
    });
  } catch (err) {
    console.error("Bulk upload error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, department, search } = req.query;
    const filter = {};
    if (role)       filter.role       = role;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name:   { $regex: search, $options: "i" } },
        { email:  { $regex: search, $options: "i" } },
        { rollNo: { $regex: search, $options: "i" } },
      ];
    }
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// PUT /admin/users/:id/toggle
const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({
      msg:      `User ${user.isActive ? "activated" : "deactivated"}`,
      isActive: user.isActive,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// DELETE /admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    await user.deleteOne();
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /admin/stats
const getStats = async (req, res) => {
  try {
    const [total, students, mentors, coordinators, admins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student"     }),
      User.countDocuments({ role: "mentor"      }),
      User.countDocuments({ role: "coordinator" }),
      User.countDocuments({ role: "admin"       }),
    ]);
    res.json({ total, students, mentors, coordinators, admins });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  bulkUploadUsers,
  getAllUsers,
  toggleUser,
  deleteUser,
  getStats,
};