// controllers/rankingController.js
const Child      = require('../models/childrenModel');
const User       = require('../models/userModel');
const mongoose   = require('mongoose');

/**
 * GET /api/rankings?month=YYYY-MM (defaults to current month)
 * Returns monthly ranking by totalScore (sum of daily evaluations' totalScore).
 * Includes all children of the user, defaulting to 0 if no evaluations.
 */
const getMonthlyRanking = async (req, res) => {
  try {
    // 1. Get user’s children
    const userId = req.user._id;
    const user   = await User.findById(userId).select('child');
    const childIds = (user.child || []).map(id => new mongoose.Types.ObjectId(id));

    // 2. Determine month filter (YYYY-MM)
    let { month } = req.query;
    if (!month) {
      const now = new Date();
      month = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    }
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Tham số month phải có định dạng YYYY-MM' });
    }

    // 3. Aggregate: start from Child to include all
    const ranking = await Child.aggregate([
      // only this user’s children
      { $match: { _id: { $in: childIds } } },

      // lookup evaluation docs in that month
      { $lookup: {
          from: 'evaluations',             // the collection name
          let: { cid: '$_id' },
          pipeline: [
            // match child + month
            { $match: {
                $expr: {
                  $and: [
                    { $eq: ['$child', '$$cid'] },
                    { $eq: [{ $substr: ['$date', 0, 7] }, month] }
                  ]
                }
              }
            },
            // sum up their totalScore
            { $group: {
                _id: null,
                monthlyScore: { $sum: '$totalScore' }
              }
            }
          ],
          as: 'monthly'
      }},

      // extract sum (or 0)
      { $addFields: {
          totalScore: { $ifNull: [{ $arrayElemAt: ['$monthly.monthlyScore', 0] }, 0] }
      }},

      // format and sort
      { $project: {
          _id:       0,
          childId:   '$_id',
          childName: '$name',
          totalScore: 1
      }},
      { $sort: { totalScore: -1, childName: 1 } }
    ]);
    console.log('Bảng xếp hạng theo tổng điểm tháng:', ranking);
    
    res.status(200).json({ data: ranking });
  } catch (err) {
    console.error('Lỗi xếp hạng theo tổng điểm tháng:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy bảng xếp hạng' });
  }
};

module.exports = { getMonthlyRanking };
