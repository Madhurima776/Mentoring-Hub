const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
    recipient: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    recipientRole: {
      type: String,
      enum: ["mentor", "student"],
    },
    type: {
      type: String,
      enum: [
        "weekly_report_pending",
        "question_unanswered",
        "offline_meet",
        "form_unfilled",
        "general",
      ],
      default: "general",
    },
    message: { type: String, trim: true },
    isRead:  { type: Boolean, default: false },
    readAt:  { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", reminderSchema);