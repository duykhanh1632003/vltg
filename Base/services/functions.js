// check ảnh và video
const fs = require("fs");

const fsPromises = require("fs/promises");
// upload file
const multer = require("multer");
const bcrypt = require("bcrypt");

// gửi mail
const nodemailer = require("nodemailer");
// tạo biến môi trường
const dotenv = require("dotenv");
// mã hóa mật khẩu
const crypto = require("crypto");
// gọi api
const axios = require("axios");


// check video
const path = require("path");
//check ảnh
const { promisify } = require("util");
// tạo token
const jwt = require("jsonwebtoken");
const slugify = require("slugify");
const MbSize = 1024 * 1024;
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif"];
const Users = require("../models/ViecLamTheoGio/Users");
const AdminUser = require("../models/ViecLamTheoGio/AdminUser");
const AdminUserRight = require("../models/ViecLamTheoGio/AdminUserRight");

// giới hạn dung lượng video < 100MB
const MAX_VIDEO_SIZE = 100 * MbSize;
// danh sách các loại video cho phép
const allowedTypes = [".mp4", ".mov", ".avi", ".wmv", ".flv"];
// giới hạn dung lượng ảnh < 2MB
const MAX_IMG_SIZE = 2 * MbSize;
// giới hạn dung lượng kho ảnh
exports.MAX_STORAGE = 300 * MbSize;

dotenv.config();

// check title
const removeAccent = (str) => {
  const accents = "àáâãäåèéêëìíîïòóôõöùúûüýÿđ";
  const accentRegex = new RegExp(`[${accents}]`, "g");
  const accentMap = {
    à: "a",
    á: "a",
    â: "a",
    ã: "a",
    ä: "a",
    å: "a",
    è: "e",
    é: "e",
    ê: "e",
    ë: "e",
    ì: "i",
    í: "i",
    î: "i",
    ï: "i",
    ò: "o",
    ó: "o",
    ô: "o",
    õ: "o",
    ö: "o",
    ù: "u",
    ú: "u",
    û: "u",
    ü: "u",
    ý: "y",
    ÿ: "y",
    đ: "d",
  };
  return str.replace(accentRegex, (match) => accentMap[match]);
};

// check title
exports.checkTilte = async (input, list) => {
  const formattedInput = removeAccent(input).toLowerCase();
  const foundKeyword = list.find((keyword) => {
    const formattedKeyword = removeAccent(keyword).toLowerCase();
    return formattedInput.includes(formattedKeyword);
  });

  if (foundKeyword) {
    return false;
  } else {
    return true;
  }
};

exports.getDatafindOne = async (model, condition) => {
  return model.findOne(condition).lean();
};

// hàm khi thành công
exports.success = (res, messsage = "", data = []) => {
  return res
    .status(200)
    .json({ data: { result: true, message: messsage, ...data }, error: null });
};

// hàm thực thi khi thất bại
exports.setError = (res, message, code = 500) => {
  return res.status(code).json({ data: null, code, error: { message } });
};

// hàm tìm id max
exports.getMaxID = async (model) => {
  const maxUser =
    (await model.findOne({}, {}, { sort: { _id: -1 } }).lean()) || 0;
  return maxUser._id;
};

// hàm check định dạng ảnh
const isImage = async (filePath) => {
  const extname = path.extname(filePath).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(extname);
};

// hàm check ảnh
exports.checkImage = async (filePath) => {
  if (typeof filePath !== "string") {
    return false;
  }

  const { size } = await promisify(fs.stat)(filePath);
  if (size > MAX_IMG_SIZE) {
    return false;
  }

  const isImg = await isImage(filePath);
  if (!isImg) {
    return false;
  }

  return true;
};

// hàm xóa file
exports.deleteImg = async (condition) => {
  if (typeof condition == "string") {
    return await deleteFile(condition);
  }

  if (typeof condition == "object") {
    return await deleteFile(condition.path);
  }
};

exports.createError = async (code, message) => {
  const err = new Error();
  err.code = code;
  err.message = message;
  return { data: null, error: err };
};

exports.verifyPassword = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

// hàm check token
exports.checkToken = (req, res, next) => {
  // if (true) {
  //   req.user = { data: { _id: 666 } }; // userId test
  //   return next();
  // }
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }
  // console.log("token>>", token);
  jwt.verify(token, process.env.NODE_SERCET, (err, user) => {
    if (err) {
      console.log("err>>>", err);
      return res.status(403).json({ message: "Invalid token" });
    }
    // console.log("user>>", user);
    req.user = user;
    next();
  });
};

// hàm tạo token
exports.createToken = async (data, time) => {
  return jwt.sign({ data }, process.env.NODE_SERCET, { expiresIn: time });
};

// hàm lấy data từ axios
exports.getDataAxios = async (url, condition) => {
  return await axios({
    method: "post",
    url: url,
    data: condition,
    headers: { "Content-Type": "multipart/form-data" },
  }).then(async (response) => {
    return response.data;
  });
};

// hàm lấy dữ liệu ngành nghề
exports.getDataCareer = async () => {
  return [
    "An toàn lao động",
    "Báo chí - Truyền hình",
    "Bảo hiểm",
    "Bảo trì",
    "Bảo vệ",
    "Biên - Phiên dịch",
    "Bưu chính viễn thông",
    "Chăm sóc khách hàng",
    "Chăn nuôi - Thú y",
    "Cơ khí - Chế tạo",
    "Công chức - Viên chức",
    "Công nghệ cao",
    "Công nghệ thực phẩm",
    "copywrite",
    "Dầu khí - Địa chất",
    "Dệt may - Da dày",
    "Dịch vụ",
    "Du lịch",
    "Freelancer",
    "Giáo dục - Đào tạo",
    "Giao thông vận tải -Thủy lợi - Cầu đường",
    "Giúp việc",
    "Hàng hải",
    "Hàng không",
    "Hành chính - Văn phòng",
    "Hóa học - Sinh học",
    "Hoạch định - Dự án",
    "In ấn - Xuất bản",
    "IT phần cứng - mạng",
    "IT phần mềm",
    "KD bất động sản",
    "Kế toán - Kiểm toán",
    "Khánh sạn - Nhà hàng",
    "Khu chế xuất - Khu công nghiệp",
    "Kiến trúc - Tk nội thất",
    "Kỹ thuật",
    "Kỹ thuật ứng dụng",
    "Làm đẹp - Thể lực - Spa",
    "Lao động phổ thông",
    "Lễ tan - PG - PB",
    "Logistic",
    "Luật - Pháp lý",
    "Lương cao",
    "Marketing - PR",
    "Môi trường - Xử lý chất thải",
    "Mỹ phẩm - Thời trang - Trang sức",
    "Ngân hàng - chứng khoán - Đầu tư",
    "Nghệ thuật - Điện ảnh",
    "Nhân sự",
    "Kinh doanh",
    "Nhập liệu",
    "Nông - Lâm - Ngư - Nghiệp",
    "Ô tô - Xe máy",
    "Pha chế - Bar",
    "Phát triển thị trường",
    "Phục vụ - Tạp vụ",
    "Quan hệ đối ngoại",
    "Quản lý điều hành",
    "Quản lý đơn hàng",
    "Quản trị kinh doanh",
    "Sản xuất - Vận hành sản xuất",
    "Sinh viên làm thêm",
    "StarUp",
    "Tài chính",
    "Telesales",
    "Thẩm định - Giảm thẩm định - Quản lý chất lượng",
    "Thể dục - Thể thao",
    "Thiết kế - Mỹ thuật",
    "Thiết kế web",
    "Thống kê",
    "Thư ký - Trợ lý",
    "Thu Ngân",
    "Thư viện",
    "Thực phẩm - Đồ uống",
    "Thương Mại điện tử",
    "Thủy Sản",
    "Thị trường - Quảng cáo",
    "Tìm việc làm thêm",
    "Tổ chức sự kiện",
    "Trắc địa",
    "Truyển thông",
    "Tư vấn",
    "Vận chuyển giao nhận",
    "Vận tải - Lái xe",
    "Vật tư - Thiết bị",
    "Việc làm bán hàng",
    "Việc làm Tết",
    "Xây dựng",
    "Xuất - nhập khẩu",
    "Xuất khẩu lao động",
    "Y tế - Dược",
    "Đầu bếp - phụ bếp",
    "Điện - Điện tử",
    "Điện tử viễn thông",
    "ngàng nghề khác",
  ];
};

// hàm lấy dữ liệu hình thức làm việc
exports.getDataWorkingForm = async () => {
  return [
    "Toàn thời gian cố định",
    "Toàn thời gian tạm thời",
    "Bán thời gian",
    "Bán thời gian tạm thời",
    "Hợp đồng",
    "Việc làm từ xa",
    "Khác",
  ];
};

// hàm lấy dữ liệu cấp bậc làm việc
exports.getDataWorkingRank = async () => {
  return [
    "Mới tốt nghiệp",
    "Thực tập sinh",
    "Nhân viên",
    "Trưởng nhóm",
    "Phó tổ trưởng",
    "Tổ trưởng",
    "Phó trưởng phòng",
    "Trưởng phòng",
    "Phó giám đốc",
    "Giám đóc",
    "Phó tổng giám đốc",
    "Tổng giám đốc",
    "Quản lý cấp trung",
    "Quản lý cấp cao",
  ];
};

// hàm lấy dữ liệu kinh nghiệm làm việc
exports.getDataEXP = async () => {
  return [
    "Không yêu cầu",
    "Chưa có kinh nghiệm",
    "0 - 1 năm kinh nghiệm",
    "Hơn 1 năm kinh nghiệm",
    "Hơn 2 năm kinh nghiệm",
    "Hơn 5 năm kinh nghiệm",
    "Hơn 10 năm kinh nghiệm",
  ];
};
// hàm lấy dữ liệu bằng cấp làm việc
exports.getDataDegree = async () => {
  return [
    "Không yêu cầu",
    "Đại học trở lên",
    "Cao đẳng trở lên",
    "THPT trở lên",
    "Trung học trở lên",
    "Chứng chỉ",
    "Trung cấp trở lên",
    "Cử nhân trở lên",
    "Thạc sĩ trở lên",
    "Thạc sĩ Nghệ thuật",
    "Thạc sĩ Thương mại",
    "Thạc sĩ Khoa học",
    "Thạc sĩ Kiến trúc",
    "Thạc sĩ QTKD",
    "Thạc sĩ Kỹ thuật ứng dụng",
    "Thạc sĩ Luật",
    "Thạc sĩ Y học",
    "Thạc sĩ Dược phẩm",
    "Tiến sĩ",
    "Khác",
  ];
};

// hàm lấy dữ liệu giới tính làm việc
exports.getDataSex = async () => {
  return ["Nam", "Nữ", "Không yêu cầu"];
};

exports.getTimeNow = () => {
  return Math.floor(Date.now() / 1000);
};

exports.getImageUv = (createTime, logo) => {
  if (logo != "" && logo != null) {
    return `${process.env.cdn}/pictures/uv/${this.convertDate(
      createTime,
      true
    )}/${logo}`;
  }
  return "";
};

exports.convertDate = (time = null, revert = false) => {
  let date;
  if (time != null) {
    date = new Date(time * 1000);
  } else {
    date = new Date();
  }
  const y = date.getFullYear();
  let d = date.getDate();
  d = d < 10 ? "0" + d : d;
  let m = date.getMonth() + 1;
  m = m < 10 ? "0" + m : m;
  if (!revert) {
    return `${d}/${m}/${y}`;
  } else {
    return `${y}/${m}/${d}`;
  }
};

//lay ra max id dua vao model va truong muon lay
exports.getMaxIdByField = async (model, field) => {
  let maxId = await model
    .findOne(
      {},
      {
        [field]: 1,
      }
    )
    .sort({
      [field]: -1,
    })
    .limit(1)
    .lean();
  if (maxId) {
    maxId = Number(maxId[`${field}`]) + 1;
  } else maxId = 1;
  return maxId;
};

//chuyen thoi gian ve dang int
exports.convertTimestamp = (date) => {
  let time = new Date(date);
  return Math.round(time.getTime() / 1000);
};

exports.convertDateToTimestamp = (date) => {
  return Math.round(Date.parse(date) / 1000);
};

exports.renderAlias = (text) => {
  return slugify(text, {
    replacement: "-", // Ký tự thay thế khoảng trắng và các ký tự đặc biệt
    lower: true, // Chuyển thành chữ thường
    strict: true, // Loại bỏ các ký tự không hợp lệ
  });
};

exports.checkAuthentic = async (req, res, next) => {
  try {
    if (!req.user || !req.user.data || !req.user.data._id)
      return this.setError(res, "Tài khoản chưa xác thực!", 403);
    let user = await Users.findOne({ _id: req.user.data._id, authentic: 1 });
    if (!user) return this.setError(res, "Tài khoản chưa xác thực!", 403);
    return next();
  } catch (error) {
    return this.setError(res, "Đã xảy ra lỗi!", 500);
  }
};

// hàm cấu hình mail
const transport = nodemailer.createTransport({
  host: process.env.NODE_MAILER_HOST,
  port: Number(process.env.NODE_MAILER_PORT),
  service: process.env.NODE_MAILER_SERVICE,
  secure: true,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

exports.sendEmailUv = async (ntd, ungVien) => {
  let body = `<body style="width: 100%;background-color: #dad7d7;text-align: justify;padding: 0;margin: 0;font-family: arial;padding-top: 20px;padding-bottom: 20px;">
            <table style="width: 700px;background:#fff; margin:0 auto;border-collapse: collapse;color: #000">
                <tr style="height: 120px;background-image: url(https://vieclamtheogio.timviec365.vn/images/banner_mailxemUV.png);background-size:100% 100%;background-repeat: no-repeat;float: left;width: 100%;padding: 0px 30px;box-sizing: border-box;">
                </tr>
                <tr><td style="padding-bottom: 20px;background: #dad7d7"></td></tr>
                <tr  style="float: left;padding:10px 15px 0px 15px;min-height: 175px;">
                    <td colspan="2">
                        <p style="font-size: 16px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-top: 15px;">Xin chào ${ungVien.userName}</p>
                        <p style="font-size: 16px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-top: 5px;">Cám ơn bạn đã tin tưởng vieclamtheogio.devopszero.id.vn là cầu nối giúp bạn tìm kiếm công việc mong muốn.</p>
                        <p style="font-size: 16px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-top: 5px;"><span><a style="    font-weight: bold;color: #307df1;text-decoration: none;" href="https://vieclamtheogio.devopszero.id.vn/ung-vien/${ungVien._id}">Hồ sơ của bạn</a> trên website vieclamtheogio.devopszero.id.vn đã được nhà tuyển dụng <span><a style="font-weight: bold;color: #307df1;text-decoration: none;" href="https://vieclamtheogio.devopszero.id.vn/'.'-co' . ${ntd._id} .'.html">${ntd.userName}</a> xem</span>. Bạn có thể tham khảo các công việc tương tự xem có phù hợp với mình không nhé!</p> 
                        <p style="font-size: 16px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-top: 5px;">Trân trọng!</p>
                    </td>
                </tr> 
                <tr><td style="padding-bottom: 20px;background: #dad7d7"></td></tr>
                
                <tr><td style="padding-bottom: 20px;background: #dad7d7"></td></tr>
                <tr  style="float: left;padding:0px 15px 0px 15px;min-height: 115px;">
                    <td>
                        <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-top: 15px;color: #307df1">Công ty Cổ phần Tìm việc 136</p>
                        <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;color:#4D4D4D"><span style="color: #307df1">VP: </span>Số 5, Ngõ 83 Tân Triêu - Thanh Trì - Hà Nội</p>
                        <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;color:#4D4D4D"><span style="color: #307df1">Hotline:</span> 0355961899</p>
                        <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-bottom: 15px;color:#4D4D4D"><span style="color: #307df1">Email hỗ trợ:</span> dung136ptit@gmail.com</p>
                    </td>
                </tr>
                <tr><td style="padding-bottom: 39px;background: #dad7d7"></td></tr>
            </table>
            </body>`;
  let subject =
    "[vieclamtheogio.devopszero.id.vn] Nhà tuyển dụng vừa xem hồ sơ của bạn";
  let options = {
    from: process.env.AUTH_EMAIL,
    to: ungVien.email,
    subject: subject,
    html: body,
  };
  transport.sendMail(options, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Message sent: " + info.response);
    }
  });
};

exports.sendEmailOTP = async (email, otp) => {
  let body = `<body style="width: 100%;background-color: #dad7d7;text-align: justify;padding: 0;margin: 0;font-family: arial;padding-top: 20px;padding-bottom: 20px;">
            <table style="width: 700px;background:#fff; margin:0 auto;border-collapse: collapse;color: #000">
                <tr  style="float: left;padding:10px 15px 0px 15px;min-height: 175px;">
                    <td colspan="2">
                      <p style="font-size: 16px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-top: 15px;">Mã otp xác thực của bạn là: ${otp}</p>
                    </td>
                </tr>
            </table>
            </body>`;
  let subject = "[vieclamtheogio.devopszero.id.vn] Mã otp xác thực";
  let options = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: subject,
    html: body,
  };
  transport.sendMail(options, (err, info) => {
    if (err) {
      console.log("Erorr when send mail:::", err);
    } else {
      console.log("Message sent: " + info.response);
    }
  });
};

exports.sendEmailNtd = async (ntd, ungVien, viecLam) => {
  let uv_name = ungVien.userName;
  let ntd_name = ntd.userName;
  let vi_tri = viecLam.vi_tri;
  let body = `<body style="width: 100%;background-color: #dad7d7;text-align: justify;padding: 0;margin: 0;font-family: unset;padding-top: 20px;padding-bottom: 20px;">
    <table style="width: 600px;background:#fff; margin:0 auto;border-collapse: collapse;color: #000">
        <tr style="height: 165px;background-image: url();background-size:100% 100%;background-repeat: no-repeat;float: left;width: 100%;padding: 0px 30px;box-sizing: border-box;">
        <td style="padding-top: 23px;float: left;">
            
            <ul style="margin-top: 15px;padding-left: 0px;">
                <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="font-size:18px;">Tìm việc 136</span></li>
                <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Đăng tin tuyển dụng miễn phí</span></li>
                <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Không giới hạn tin đăng tuyển dụng</span></li>
                <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Biểu mẫu nhân sự chuyên nghiệp</span></li>
            </ul>
        </td>
        <td style="text-align: left;float: right;">
                      
        </td>
        </tr>
        <tr  style="float: left;padding:10px 30px 30px 30px;min-height: 289px;">
        <td colspan="2">
            <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-top: 15px;">Xin chào ${ntd_name}</p>
            <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Ứng viên <span style="color: #307df1">${uv_name}</span> đã ứng tuyển vào tin đăng <span style="color: #307df1;">${vi_tri}</span> của quý công ty</p>            
            <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Để xem thông tin chi tiết ứng viên:</p>
            <p style="margin: auto;margin-top: 20px;text-align: center;border-radius: 5px;width: 265px;height: 45px;background:#307df1;border-radius: 5px;"><a href="https://vieclamtheogio.devopszero.id.vn/ung-vien/${ungVien._id}" style="color: #fff;text-decoration: none;font-size: 18px;line-height: 43px;">Xem chi tiết ứng viên</a></p>
        </td>
        </tr>
        <tr><td style="padding-bottom: 20px;background: #dad7d7"></td></tr>
        <tr  style="float: left;padding:0px 15px 0px 15px;min-height: 115px;">
            <td>
                <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-top: 15px;color: #307df1">Công ty Cổ phần Tìm việc 136</p>
                <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;color:#4D4D4D"><span style="color: #307df1">VP: </span>Số 5, Ngõ 83 Tân Triêu - Thanh Trì - Hà Nội</p>
                <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;color:#4D4D4D"><span style="color: #307df1">Hotline:</span> 0355961899</p>
                <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-bottom: 15px;color:#4D4D4D"><span style="color: #307df1">Email hỗ trợ:</span> dung136ptit@gmail.com</p>
            </td>
        </tr>
        <tr><td style="padding-bottom: 39px;background: #dad7d7"></td></tr>
        `;

  let subject = uv_name + " đã ứng tuyển vào vị trí " + vi_tri;
  let options = {
    from: process.env.AUTH_EMAIL,
    to: ntd.email,
    subject: subject,
    html: body,
  };
  transport.sendMail(options, (err, info) => {
    if (err) {
      console.log("err message::::", err);
    } else {
      console.log("Message sent: " + info.response);
    }
  });
};

exports.sendEmailApplySuccessToUv = async (ntd, ungVien, viecLam) => {
  let uv_name = ungVien.userName;
  let ntd_name = ntd.userName;
  let vi_tri = viecLam.vi_tri;
  let body = `<body style="width: 100%;background-color: #dad7d7;text-align: justify;padding: 0;margin: 0;font-family: unset;padding-top: 20px;padding-bottom: 20px;">
    <table style="width: 600px;background:#fff; margin:0 auto;border-collapse: collapse;color: #000">
        <tr style="height: 165px;background-image: url();background-size:100% 100%;background-repeat: no-repeat;float: left;width: 100%;padding: 0px 30px;box-sizing: border-box;">
        <td style="padding-top: 23px;float: left;">
          <ul style="margin-top: 15px;padding-left: 0px;">
              <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="font-size:18px;">Tìm việc 136</span></li>
              <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Đăng tin tuyển dụng miễn phí</span></li>
              <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Không giới hạn tin đăng tuyển dụng</span></li>
              <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Biểu mẫu nhân sự chuyên nghiệp</span></li>
          </ul>
        </td>
        <td style="text-align: left;float: right;">
          
        </td>
        </tr>
        <tr  style="float: left;padding:10px 30px 30px 30px;min-height: 289px;">
        <td colspan="2">
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-top: 15px; text-align: center; font-weight: bold;">Ứng tuyển thành công</p>
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-top: 15px;">Xin chào <span style="color: #307df1">${uv_name}</span></p>
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Thông tin ứng tuyển của bạn đã được gửi đến: <span style="color: #307df1;">${ntd_name}</span></p>            
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Bạn đã ứng tuyển vào công việc: <span style="color: #307df1;">${vi_tri}</span></p>
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Nhà tuyển dụng sẽ đánh giá và liên hệ với bạn sớm nhất nếu hồ sơ của bạn phù hợp.</p>
        </td>
        </tr>
        <tr><td style="padding-bottom: 20px;background: #dad7d7"></td></tr>
        <tr  style="float: left;padding:0px 15px 0px 15px;min-height: 115px;">
          <td>
              <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-top: 15px;color: #307df1">Công ty Cổ phần Tìm việc 136</p>
              <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;color:#4D4D4D"><span style="color: #307df1">VP: </span>Số 5, Ngõ 83 Tân Triêu - Thanh Trì - Hà Nội</p>
              <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;color:#4D4D4D"><span style="color: #307df1">Hotline:</span> 0355961899</p>
              <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-bottom: 15px;color:#4D4D4D"><span style="color: #307df1">Email hỗ trợ:</span> dung136ptit@gmail.com</p>
          </td>
        </tr>
        <tr><td style="padding-bottom: 39px;background: #dad7d7"></td></tr>
        `;

  let subject = "Bạn vừa ứng tuyển thành công vào vị trí " + vi_tri;
  let options = {
    from: process.env.AUTH_EMAIL,
    to: ungVien.email,
    subject: subject,
    html: body,
  };
  transport.sendMail(options, (err, info) => {
    if (err) {
      console.log("err message::::", err);
    } else {
      console.log("Message sent: " + info.response);
    }
  });
};

exports.sendEmailUvChuaPhuHop = async (ntd, ungVien, viecLam) => {
  let uv_name = ungVien.userName;
  let ntd_name = ntd.userName;
  let vi_tri = viecLam.vi_tri;
  let body = `<body style="width: 100%;background-color: #dad7d7;text-align: justify;padding: 0;margin: 0;font-family: unset;padding-top: 20px;padding-bottom: 20px;">
    <table style="width: 600px;background:#fff; margin:0 auto;border-collapse: collapse;color: #000">
        <tr style="height: 165px;background-image: url();background-size:100% 100%;background-repeat: no-repeat;float: left;width: 100%;padding: 0px 30px;box-sizing: border-box;">
        <td style="padding-top: 23px;float: left;">
          <ul style="margin-top: 15px;padding-left: 0px;">
              <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="font-size:18px;">Tìm việc 136</span></li>
              <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Đăng tin tuyển dụng miễn phí</span></li>
              <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Không giới hạn tin đăng tuyển dụng</span></li>
              <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Biểu mẫu nhân sự chuyên nghiệp</span></li>
          </ul>
        </td>
        <td style="text-align: left;float: right;">
          
        </td>
        </tr>
        <tr  style="float: left;padding:10px 30px 30px 30px;min-height: 289px;">
        <td colspan="2">
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-top: 15px;">Xin Chào <span style="color: #307df1">${uv_name}</span></p>
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Cảm ơn bạn đã dành thời gian tham gia ứng tuyển cho vị trí <span style="color: #307df1;">${vi_tri}</span> tại <span style="color: #307df1;">${ntd_name}.</span></p>            
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Sau khi xem xét các hồ sơ ứng tuyển nhận được cho vị trí này, nhà tuyển dụng đã đánh giá hồ sơ của bạn là: <span style="color: #307df1;">Chưa phù hợp</span></p>
        </td>
        </tr>
        <tr><td style="padding-bottom: 20px;background: #dad7d7"></td></tr>
        <tr  style="float: left;padding:0px 15px 0px 15px;min-height: 115px;">
          <td>
              <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-top: 15px;color: #307df1">Công ty Cổ phần Tìm việc 136</p>
              <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;color:#4D4D4D"><span style="color: #307df1">VP: </span>Số 5, Ngõ 83 Tân Triêu - Thanh Trì - Hà Nội</p>
              <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;color:#4D4D4D"><span style="color: #307df1">Hotline:</span> 0355961899</p>
              <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-bottom: 15px;color:#4D4D4D"><span style="color: #307df1">Email hỗ trợ:</span> dung136ptit@gmail.com</p>
          </td>
        </tr>
        <tr><td style="padding-bottom: 39px;background: #dad7d7"></td></tr>
        `;

  let subject = "Thông báo kết quả tuyển dụng " + ntd_name;
  let options = {
    from: process.env.AUTH_EMAIL,
    to: ungVien.email,
    subject: subject,
    html: body,
  };
  transport.sendMail(options, (err, info) => {
    if (err) {
      console.log("err message::::", err);
    } else {
      console.log("Message sent: " + info.response);
    }
  });
};

exports.sendEmailUvPhuHop = async (ntd, ungVien, viecLam) => {
  let uv_name = ungVien.userName;
  let ntd_name = ntd.userName;
  let vi_tri = viecLam.vi_tri;
  let body = `<body style="width: 100%;background-color: #dad7d7;text-align: justify;padding: 0;margin: 0;font-family: unset;padding-top: 20px;padding-bottom: 20px;">
    <table style="width: 600px;background:#fff; margin:0 auto;border-collapse: collapse;color: #000">
        <tr style="height: 165px;background-image: url();background-size:100% 100%;background-repeat: no-repeat;float: left;width: 100%;padding: 0px 30px;box-sizing: border-box;">
        <td style="padding-top: 23px;float: left;">
          <ul style="margin-top: 15px;padding-left: 0px;">
              <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="font-size:18px;">Tìm việc 136</span></li>
              <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Đăng tin tuyển dụng miễn phí</span></li>
              <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Không giới hạn tin đăng tuyển dụng</span></li>
              <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Biểu mẫu nhân sự chuyên nghiệp</span></li>
          </ul>
        </td>
        <td style="text-align: left;float: right;">
          
        </td>
        </tr>
        <tr  style="float: left;padding:10px 30px 30px 30px;min-height: 289px;">
        <td colspan="2">
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-top: 15px; text-align: center; font-weight: bold;">Hồ sơ phù hợp!</p>
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-top: 15px;">Xin Chào <span style="color: #307df1">${uv_name}</span></p>
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Cảm ơn bạn đã dành thời gian tham gia ứng tuyển cho vị trí <span style="color: #307df1;">${vi_tri}</span> tại <span style="color: #307df1;">${ntd_name}.</span></p>            
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Sau khi xem xét các hồ sơ ứng tuyển nhận được cho vị trí này, nhà tuyển dụng đã đánh giá hồ sơ của bạn là: <span style="color: #307df1;">Phù hợp</span></p>
          <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Nhà tuyển dụng sẽ liên hệ với bạn sớm nhất để trao đổi cụ thể về công việc.</p>
        </td>
        </tr>
        <tr><td style="padding-bottom: 20px;background: #dad7d7"></td></tr>
        <tr  style="float: left;padding:0px 15px 0px 15px;min-height: 115px;">
          <td>
              <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-top: 15px;color: #307df1">Công ty Cổ phần Tìm việc 136</p>
              <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;color:#4D4D4D"><span style="color: #307df1">VP: </span>Số 5, Ngõ 83 Tân Triêu - Thanh Trì - Hà Nội</p>
              <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;color:#4D4D4D"><span style="color: #307df1">Hotline:</span> 0355961899</p>
              <p style="margin: 0;font-size: 14px;margin: 0;line-height: 19px;margin-bottom: 5px;padding-bottom: 15px;color:#4D4D4D"><span style="color: #307df1">Email hỗ trợ:</span> dung136ptit@gmail.com</p>
          </td>
        </tr>
        <tr><td style="padding-bottom: 39px;background: #dad7d7"></td></tr>
        `;

  let subject = "Thông báo kết quả tuyển dụng " + ntd_name;
  let options = {
    from: process.env.AUTH_EMAIL,
    to: ungVien.email,
    subject: subject,
    html: body,
  };
  transport.sendMail(options, (err, info) => {
    if (err) {
      console.log("err message::::", err);
    } else {
      console.log("Message sent: " + info.response);
    }
  });
};

exports.sendEmailForgotPassword = async (email, password) => {
  let body = `<body style="width: 100%;background-color: #dad7d7;text-align: justify;padding: 0;margin: 0;font-family: unset;padding-top: 20px;padding-bottom: 20px;">
    <table style="width: 600px;background:#fff; margin:0 auto;border-collapse: collapse;color: #000">
        <tr  style="float: left;padding:10px 30px 30px 30px;min-height: 289px;">
        <td colspan="2">
            <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-top: 15px;">Bạn vừa gửi yêu cầu reset mật khẩu</p>
            <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Mật khẩu mới của bạn là: <span style="color: #307df1;">${password}</span></p>
            <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Bạn vui lòng đăng nhập và đổi mật khẩu ngay sau khi đăng nhập. Trân trọng!</p>
        </td>
        </tr>`;
  let subject = "Reset mật khẩu";
  let options = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: subject,
    html: body,
  };
  transport.sendMail(options, (err, info) => {
    if (err) {
      console.log("err message::::", err);
    } else {
      console.log("Message sent: " + info.response);
    }
  });
};

exports.checkCompany = async (req, res, next) => {
  let id_ntd = req?.user?.data?._id;
  let ntd = await Users.findOne({ _id: id_ntd, type: 1 });
  if (ntd) {
    return next();
  }
  return this.setError(res, "Not company or company not found!");
};

exports.checkCandidate = async (req, res, next) => {
  let uv = await Users.findOne({ _id: req?.user?.data?._id, type: 0 });
  if (uv) {
    return next();
  }
  return this.setError(res, "Not candidate or candidate not found!");
};

// ham check admin viec lam theo gio
exports.checkAdmin = async (req, res, next) => {
  let user = req.user.data;
  let admin = await this.getDatafindOne(AdminUser, {
    adm_id: user.adm_id,
    adm_active: 1,
  });
  if (admin && admin.adm_active == 1) {
    req.infoAdmin = admin;
    return next();
  }
  return next()
  return this.setError(res, "is not admin VLTG or not active");
};

//check quyen admin
exports.checkRight = (moduleId, perId) => {
  return async (req, res, next) => {
    try {
      if (!moduleId || !perId) {
        return this.setError(res, "Missing input moduleId or perId", 505);
      }
      let infoAdmin = req.infoAdmin;
      if (infoAdmin.adm_isadmin) return next();
      let permission = await AdminUserRight.findOne(
        { adu_admin_id: infoAdmin.adm_id, adu_admin_module_id: moduleId },
        { adu_add: 1, adu_edit: 1, adu_delete: 1 }
      );
      if (!permission) {
        return this.setError(res, "No right", 403);
      }
      if (perId == 1) return next();
      if (perId == 2 && permission.adu_add == 1) return next();
      if (perId == 3 && permission.adu_edit == 1) return next();
      if (perId == 4 && permission.adu_delete == 1) return next();
      return this.setError(res, "No right", 403);
    } catch (e) {
      return res.status(505).json({ message: e });
    }
  };
};

// hàm check ảnh
exports.checkFile = async (filePath) => {
  if (typeof filePath !== "string") {
    return false;
  }
  const { size } = await promisify(fs.stat)(filePath);
  if (size > MAX_FILE_SIZE) {
    return false;
  }
  //check dinh dang file
  let fileCheck = path.extname(filePath);
  if (allowedExtensions.includes(fileCheck.toLocaleLowerCase()) === false) {
    return false;
  }
  return true;
};

exports.uploadFileNameRandom = async (folder, time_created, file_img) => {
  let filename = "";
  const date = new Date(time_created * 1000);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const timestamp = Math.round(date.getTime() / 1000);

  const dir = `../storage/base/vltg/pictures/${folder}/${year}/${month}/${day}/`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  filename = `${timestamp}-user-${file_img.originalFilename}`.replace(/,/g, "");
  const filePath = dir + filename;
  fs.readFile(file_img.path, (err, data) => {
    if (err) {
      console.log(err);
    }
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        console.log(err);
      }
    });
  });
  return filename;
};

exports.getLinkFile = (folder, time, fileName) => {
  return "https://weone.vn/wp-content/uploads/2022/01/cach-xay-dung-hinh-anh-doanh-nghiep-3.png"
  if (!fileName) return "";
  let date = new Date(time * 1000);
  const y = date.getFullYear();
  const m = ("0" + (date.getMonth() + 1)).slice(-2);
  const d = ("0" + date.getDate()).slice(-2);
  let link =
    process.env.local +
    `/base/vltg/pictures/${folder}/${y}/${m}/${d}/${fileName}`;
  return link;
};

// hàm check title khi update
exports.removeSimilarKeywords = (keyword, arr) => {
  return arr.filter((file) => !file.startsWith(keyword));
};

// hàm mã otp ngẫu nhiên có 6 chữ số
exports.randomNumber = Math.floor(Math.random() * 900000) + 100000;
exports.keywordsTilte = ["hot", "tuyển gấp", "cần gấp", "lương cao"];

// hàm validate link
exports.checkLink = async (link) => {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlRegex.test(link);
};

// hàm validate thơi gian
exports.checkTime = async (time) => {
  const currentTime = new Date(); // Lấy thời gian hiện tại
  const inputTime = new Date(time); // Thời gian nhập vào
  if (inputTime < currentTime) {
    return false;
  } else {
    return true;
  }
};

// hàm check thời gian đăng tin 10p/1 lần
exports.isCurrentTimeGreaterThanInputTime = (timeInput) => {
  const now = this.getTimeNow();

  const diffInMinutes = (now - timeInput) / 60;
  console.log(diffInMinutes);

  if (diffInMinutes >= 10) {
    return true;
  } else {
    return false;
  }
};

exports.getDatafind = async (model, condition) => {
  return model.find(condition).lean();
};

exports.getDatafindOneAndUpdate = async (model, condition, projection) => {
  return model.findOneAndUpdate(condition, projection);
};

// hàm validate phone
exports.checkPhoneNumber = async (phone) => {
  const phoneNumberRegex = /^(?:\+84|0|\+1)?([1-9][0-9]{8,9})$/;
  return phoneNumberRegex.test(phone);
};

// hàm validate email
exports.checkEmail = async (email) => {
  const gmailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return gmailRegex.test(email);
};

exports.findCount = async (model, filter) => {
  try {
    const count = await model.countDocuments(filter);
    return count;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.findDistinctCount = async (model, filter, distinctField) => {
  try {
    const distinctValues = await model.distinct(distinctField, filter);
    return distinctValues.length;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getUrlLogoCompany = (createTime, logo) => {
  try {
    if (logo != null && logo != "") {
      return `${process.env.cdn}/pictures/${this.convertDate(
        createTime,
        true
      )}/${logo}`;
    } else {
      return logo;
    }
  } catch (error) {
    console.log(error);
  }
};

exports.checkDate = (date) => {
  let data = new Date(date);
  return data instanceof Date && !isNaN(data);
};

exports.pageFindWithFields = async (
  model,
  condition,
  fields,
  sort,
  skip,
  limit
) => {
  return model
    .find(condition, fields)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

exports.pageFind = async (model, condition, sort, skip, limit, select) => {
  return model
    .find(condition, select)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};
