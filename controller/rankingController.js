// controllers/rankingController.js
const Evaluation = require('../models/evalutionModel');
const Child = require('../models/childrenModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

/**
 * GET /api/rankings?month=YYYY-MM (mặc định tháng hiện tại)
 * Trả về bảng xếp hạng trẻ theo tháng, tính theo số hoạt động 'completed'.
 * Luôn bao gồm tất cả trẻ của user, điểm mặc định 0 nếu không có completed.
 */
const getMonthlyRanking = async (req, res) => {
  try {
    // Lấy user và danh sách childIds
    const userId = req.user._id;
    const user = await User.findById(userId).select('child');
    // Chuyển string IDs thành ObjectId: phải dùng 'new'
    const childIds = (user.child || []).map(id => new mongoose.Types.ObjectId(id));

    // Xác định tháng
    let { month } = req.query;
    if (!month) {
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      month = `${now.getFullYear()}-${mm}`;
    }
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Tham số month phải có định dạng YYYY-MM' });
    }

    // Pipeline: bắt đầu từ Children để include all, rồi lookup evaluations
    const ranking = await Child.aggregate([
      { $match: { _id: { $in: childIds } } },
      { $lookup: {
          from: 'evaluations',
          let: { childId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [
                  { $eq: ['$child', '$$childId'] },
                  { $eq: [{ $substr: ['$date', 0, 7] }, month] }
            ] } } },
            { $unwind: '$evaluations' },
            { $match: { 'evaluations.status': 'completed' } },
            { $count: 'points' }
          ],
          as: 'stats'
      } },
      { $addFields: { points: { $ifNull: [{ $arrayElemAt: ['$stats.points', 0] }, 0] } } },
      { $project: { _id: 0, childId: '$_id', childName: '$name', points: 1 } },
      { $sort: { points: -1, childName: 1 } }
    ]);

    res.status(200).json({ data: ranking });
  } catch (error) {
    console.error('Lỗi xếp hạng theo tháng:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy bảng xếp hạng' });
  }
};

module.exports = { getMonthlyRanking };
