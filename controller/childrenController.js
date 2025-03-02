const Children = require("../models/childrenModel");
const Schedule = require("../models/scheduleModel");
const User = require("../models/userModel");

const addChild = async (req, res) => {
  try {
    const { userId, name, birthYear, gender } = req.body;

    // Kiểm tra xem user có tồn tại không
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("Người dùng không tồn tại");
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const newChild = new Children({
      userId: req.user.id,
      name,
      birthYear,
      gender,
    });

    await newChild.save();
    console.log("Thêm trẻ thành công");
    res.status(201).json({ message: "Thêm trẻ thành công", newChild });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

const getChildren = async (req, res) => {
  try {
    let children;
    if (req.user.role === "admin") {
      // Admin thấy tất cả trẻ
      children = await Children.find().populate(
        "userId",
        "name birthYear gender schedules"
      );
    } else {
      // User chỉ thấy con của mình
      children = await Children.find({ userId: req.user.id });
    }
    console.log("Lấy danh sách trẻ thành công: ", children);
    res.status(200).json(children);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

const getChildById = async (req, res) => {
  try {
    const child = await Children.findById(req.params.id);

    console.log("child: ", child);
    console.log("id: ", req.params.id);

    if (!child) {
      console.log("Không tìm thấy trẻ");
      return res.status(404).json({ message: "Không tìm thấy trẻ" });
    }

    // Nếu là user, kiểm tra quyền truy cập
    if (req.user.role !== "admin" && child.userId.toString() !== req.user.id) {
      console.log("Bạn không có quyền truy cập");
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
    console.log("Lấy thông tin trẻ thành công: ", child);
    res.status(200).json(child);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// const updateChild = async (req, res) => {
//   try {
//     const { name, birthYear, gender } = req.body;
//     const child = await Children.findById(req.params.id);

//     if (!child) {
//       return res.status(404).json({ message: "Không tìm thấy trẻ" });
//     }

//     // Nếu không phải admin, kiểm tra quyền truy cập
//     if (req.user.role !== "admin" && child.userId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa" });
//     }

//     // Cập nhật thông tin
//     if (name) child.name = name;
//     if (birthYear) child.birthYear = birthYear;
//     if (gender) child.gender = gender;

//     await child.save();
//     res.status(200).json({ message: "Cập nhật thành công", child });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Lỗi server", error });
//   }
// };

const updateChild = async (req, res) => {
  const { id } = req.params;
  const { name, birthYear, gender, schedules } = req.body;

  try {
    const child = await Children.findById(id);
    if (!child) {
      console.log("Không tìm thấy trẻ");      
      return res.status(404).json({ message: "Không tìm thấy trẻ" });
    }

    // Kiểm tra quyền cập nhật
    const isAdmin = req.user.role === "admin";
    const isOwner = child.userId.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      console.log("Bạn không có quyền chỉnh sửa");
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa" });
    }

    // Cập nhật thông tin cá nhân
    if (name) child.name = name;
    if (birthYear) child.birthYear = birthYear;
    if (gender) child.gender = gender;

    // Cập nhật thời khóa biểu nếu có trong request
    if (schedules && Array.isArray(schedules)) {
      for (const scheduleData of schedules) {
        const { semester, academicYear, activities } = scheduleData;

        let schedule = await Schedule.findOne({
          _id: { $in: child.schedules },
          semester,
          academicYear,
        });

        if (schedule) {
          // Nếu đã có thời khóa biểu cho học kỳ và năm học đó, cập nhật
          schedule.activities = activities;
          await schedule.save();
        } else {
          // Nếu chưa có, tạo mới và thêm vào danh sách schedules của trẻ
          schedule = await Schedule.create({
            semester,
            academicYear,
            activities,
          });
          child.schedules.push(schedule._id);
        }
      }
    }

    await child.save();

    console.log("Cập nhật thành công: ", child);
    res.status(200).json({
      message: "Cập nhật thành công",
      child,
    });
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 📌 5. Xóa trẻ
const deleteChild = async (req, res) => {
  try {
    const child = await Children.findById(req.params.id);

    if (!child) {
      console.log("Không tìm thấy trẻ");      
      return res.status(404).json({ message: "Không tìm thấy trẻ" });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== "admin" && child.userId.toString() !== req.user.id) {
      console.log("Bạn không có quyền xóa");
      return res.status(403).json({ message: "Bạn không có quyền xóa" });
    }

    await child.deleteOne();
    console.log("Xóa thành công");
    res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

module.exports = {
  addChild,
  getChildren,
  getChildById,
  updateChild,
  deleteChild,
};
