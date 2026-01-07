const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  date: String,
  time: String,
  endTime: String,   // ✅ NEW
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model("Task", TaskSchema);
