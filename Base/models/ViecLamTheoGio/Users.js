const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
      autoIncrement: true,
    },
    email: {
      // Email đăng nhập (nếu đối tượng đăng ký bằng email)
      type: String,
      required: true,
    },
    phone: {
      // Sđt liên hệ
      type: String,
      default: null,
    },
    userName: {
      // Tên của đối tượng
      type: String,
    },
    alias: {
      // Phục vụ sinh ra url seo (slug)
      type: String,
      default: null,
    },
    avatarUser: {
      // Ảnh đại diện
      type: String,
      default: null,
    },
    type: {
      // 0: Cá nhân, 1: Công ty, 2: Nhân viên
      type: Number,
      required: true,
    },
    password: {
      // Mật khẩu đăng nhập
      type: String,
      // required: true,
    },
    city: {
      // Tỉnh thành của đối tượng khi đăng ký
      type: Number,
      default: null,
    },
    district: {
      // Quận huyện của đối tượng khi đăng ký
      type: Number,
      default: null,
    },
    address: {
      // Địa chỉ chi tiết của đối tượng khi đăng ký
      type: String,
      default: null,
    },
    authentic: {
      // Tình trạng kích hoạt tài khoản hay chưa (0: Chưa kích hoạt, 1: Đã kích hoạt)
      type: Number,
      default: 0,
    },
    createdAt: {
      // Thời gian đăng ký
      type: Number,
      default: 0,
    },
    updatedAt: {
      // Thời gian cập nhật
      type: Number,
      default: 0,
    },
    birthday: {
      // Ngày sinh
      type: Number,
      default: null,
    },
    gender: {
      // Giới tính
      type: Number,
      default: 0,
    },
    married: {
      // Tình trạng hôn nhân
      type: Number,
      default: 0,
    },
    experience: {
      // Kinh nghiệm làm việc trong thông tin liên hệ
      type: Number,
      default: 0,
    },
    education: {
      // Học vấn
      type: Number,
      default: 0,
    },
    uv_day: {
      type: String,
      default: null,
    },
    uv_search: {
      type: Number,
      default: 1,
    },
    active: {
      type: Number,
      default: 0,
    },
    luot_xem: {
      type: Number,
      default: 0,
    },
    diem_free: {
      type: Number,
      default: 0,
    },
    diem_mua: {
      type: Number,
      default: 0,
    },
    otp: {
      type: Number,
      default: null,
    },
    time_send_otp: {
      type: Date,
      default: null,
    },
    com_size: {
      // Quy mô công ty
      type: String,
      default: null,
    },
    usc_mst: {
      // Mã số thuế
      type: String,
      default: null,
    },
    usc_website: {
      // Website công ty
      type: String,
      default: null,
    },
    description: {
      // Mô tả công ty
      type: String,
      default: null,
    },
    usc_name: {
      // Tên người liên hệ
      type: String,
      default: null,
    },
    usc_name_add: {
      // Địa chỉ người liên hệ
      type: String,
      default: null,
    },
    usc_name_phone: {
      // SĐT người liên hệ
      type: String,
      default: null,
    },
    usc_name_email: {
      // Email người liên hệ
      type: String,
      default: null,
    },
  },
  {
    collection: "Users",
    versionKey: false,
    timestamp: true,
  }
);

// UserSchema.index({
//   "inForCompany.description": "text",
//   userName: "text",
//   "inForCompany.usc_lv": "text",
//   updatedAt: 1,
// });

module.exports = mongoose.model("Users", UserSchema);
