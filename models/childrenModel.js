const mongoose = require("mongoose");

const ChildrenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    birthYear: { type: Number, required: true },
    gender: { type: String, enum: ["Nam", "Nữ", "Khác"], required: true },
    schedules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Schedule" }],
  },
  { timestamps: true }
);

const Children = mongoose.model("Children", ChildrenSchema);
module.exports = Children;
