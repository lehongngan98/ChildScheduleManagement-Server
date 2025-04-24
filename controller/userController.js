// controllers/userController.js
const User = require('../models/userModel');

/**
 * GET /api/users
 * Trả về danh sách tất cả người dùng (user + admin)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password') // không trả về mật khẩu
      .sort({ createdAt: -1 });
      console.log('Danh sách người dùng:', users);
      
    res.status(200).json({ data: users });
  } catch (error) {
    console.error('Lỗi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy người dùng' });
  }
};

/**
 * GET /api/users/:id
 * Lấy chi tiết một người dùng theo ID
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.status(200).json({ data: user });
  } catch (error) {
    console.error('Lỗi lấy user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * DELETE /api/users/:id
 * Xóa người dùng theo ID
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    await user.deleteOne();
    res.status(200).json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Lỗi xóa user:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa người dùng' });
  }
};

module.exports = { getAllUsers, getUserById, deleteUser };