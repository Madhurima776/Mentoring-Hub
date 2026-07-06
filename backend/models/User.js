const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // --- Core (pre-loaded via CSV, cannot be changed) ---
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },

    // --- Auth ---
    password: {
      type:      String,
      required:  true,
      minlength: 6,
    },
    isFirstLogin: {
      type:    Boolean,
      default: true,
    },

    // --- Role ---
    role: {
      type:    String,
      enum: ["student", "mentor", "coordinator", "admin"],
      default: "student",
    },

    // --- Academic Info (pre-loaded via CSV) ---
    rollNo:     { type: String, trim: true },
    employeeId: { type: String, trim: true },
    department: { type: String, trim: true },
    branch:     { type: String, trim: true },
    section:    { type: String, trim: true },
    semester:   { type: Number },
    batch:      { type: String, trim: true },

    // --- Personal Info (student can update) ---
    personalInfo: {
      phone:       { type: String, trim: true },
      dob:         { type: Date },
      gender:      { type: String, enum: ["male", "female", "other"] },
      address:     { type: String, trim: true },
      parentName:  { type: String, trim: true },
      parentPhone: { type: String, trim: true },
      parentEmail: { type: String, trim: true },
      bloodGroup:  { type: String, trim: true },
    },

    // --- Extra Curricular (student can update) ---
    extraCurricular: [
      {
        activity:    { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],

    // --- Awards & Hackathons (student updates monthly) ---
    awards: [
      {
        title:       { type: String, trim: true },
        description: { type: String, trim: true },
        month:       { type: String },
        type: {
          type: String,
          enum: ["award", "hackathon", "competition", "other"],
        },
      },
    ],

    // --- Certifications ---
    certifications: [
      {
        title:         { type: String, trim: true },
        issuedBy:      { type: String, trim: true },
        issuedDate:    { type: Date },
        description:   { type: String, trim: true },
        fileUrl:       { type: String },
        uploadedMonth: { type: String }, // e.g. "May 2026"
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);