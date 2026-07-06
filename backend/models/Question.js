const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    mentor: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    student: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    category: {
      type:    String,
      enum:    ["attendance", "project", "academic", "behaviour", "general"],
      default: "general",
    },
    question:      { type: String, required: true, trim: true },
    answer:        { type: String, trim: true, default: "" },
    isAnswered:    { type: Boolean, default: false },
    answeredAt:    { type: Date },
    weekStartDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);