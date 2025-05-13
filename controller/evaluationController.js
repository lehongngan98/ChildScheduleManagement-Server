const Evaluation = require("../models/evalutionModel");
const ThoiGianBieu = require("../models/thoiGianBieu");

// controllers/evaluationController.js
const completeEvaluation = async (req, res) => {
  try {
    const { childId, date, totalScore, evaluations } = req.body;
    if (!childId || !date || !Array.isArray(evaluations)) {
      return res.status(400).json({ message: "Thiếu dữ liệu đầu vào!" });
    }

    // Validate activities...
    for (const ev of evaluations) {
      if (!await ThoiGianBieu.findById(ev.activityId)) {
        return res.status(404)
          .json({ message: `Không tìm thấy hoạt động ID: ${ev.activityId}` });
      }
    }

    const newEval = new Evaluation({
      child: childId,
      date,
      totalScore,
      evaluations,
    });
    await newEval.save();

    res.status(201).json({
      message: "Hoàn tất đánh giá thành công!",
      data: newEval,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
  }
};


const getEvaluationByChildAndDate = async (req, res) => {
  try {
    const { childId, date } = req.query;
    console.log("thông tin nhận:", req.query);
    
    if (!childId || !date) {
      return res.status(400).json({ message: "Thiếu dữ liệu đầu vào!" });
    }

    const evaluation = await Evaluation.findOne({ child: childId, date });

    if (!evaluation) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá!" });
    }
    console.log("Đánh giá:", evaluation);
    
    res.status(200).json({ message: "Lấy đánh giá thành công!", data: evaluation });
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error.message);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
  }
};

const updateEvaluation = async (req, res) => {
  try {
    const { childId, date, totalScore, evaluations } = req.body;
    if (!childId || !date || !Array.isArray(evaluations)) {
      return res.status(400).json({ message: "Thiếu dữ liệu đầu vào!" });
    }

    // Validate activities...
    for (const ev of evaluations) {
      if (!await ThoiGianBieu.findById(ev.activityId)) {
        return res.status(404)
          .json({ message: `Không tìm thấy hoạt động ID: ${ev.activityId}` });
      }
    }

    const updatedEval = await Evaluation.findOneAndUpdate(
      { child: childId, date },
      { totalScore, evaluations },
      { new: true }
    );

    if (!updatedEval) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá để cập nhật!" });
    }

    res.status(200).json({
      message: "Cập nhật đánh giá thành công!",
      data: updatedEval,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
  }
};


module.exports = {
  completeEvaluation,
  getEvaluationByChildAndDate,
  updateEvaluation,
};


