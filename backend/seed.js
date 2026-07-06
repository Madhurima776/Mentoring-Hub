require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("./models/User");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // ── Clear existing users (optional: comment out if you want to keep data) ──
  await User.deleteMany({});
  console.log("🗑️  Cleared existing users");

  // ── Create all users ──
  const users = [
    // Admin
    {
      name:         "Admin",
      email:        "admin@svecw.edu.in",
      password:     "Welcome@123",
      role:         "admin",
      isFirstLogin: false,
      isActive:     true,
    },

    // Coordinator
    {
      name:         "Sunitha Rao",
      email:        "sunitha.rao@svecw.edu.in",
      password:     "Welcome@123",
      role:         "coordinator",
      department:   "CSE",
      isFirstLogin: false,
      isActive:     true,
    },

    // Mentor (example)
    {
      name:         "Ravi Kumar",
      email:        "ravi.kumar@svecw.edu.in",
      password:     "Welcome@123",
      role:         "mentor",
      department:   "CSE",
      isFirstLogin: true,
      isActive:     true,
    },

    // Student (example)
    {
      name:         "Priya Sharma",
      email:        "priya.sharma@svecw.edu.in",
      password:     "Welcome@123",
      role:         "student",
      department:   "CSE",
      rollNo:       "21B91A0501",
      branch:       "CSE",
      section:      "A",
      semester:     4,
      batch:        "2021-2025",
      isFirstLogin: true,
      isActive:     true,
    },
  ];

  // Use insertMany won't trigger pre("save") hook for password hashing,
  // so we create each user individually to ensure passwords are hashed
  for (const userData of users) {
    await User.create(userData);
    console.log(`✅ Created: ${userData.email} (${userData.role})`);
  }

  console.log("\n📋 Login Credentials:");
  console.log("─────────────────────────────────────────");
  console.log("Admin:       admin@svecw.edu.in       | Welcome@123");
  console.log("Coordinator: sunitha.rao@svecw.edu.in | Welcome@123");
  console.log("Mentor:      ravi.kumar@svecw.edu.in  | Welcome@123");
  console.log("Student:     priya.sharma@svecw.edu.in| Welcome@123");
  console.log("─────────────────────────────────────────");

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});