const Users = require("../../models/ViecLamTheoGio/Users");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");
const UvCvmm = require("../../models/ViecLamTheoGio/UvCvmm");
const UvKnlv = require("../../models/ViecLamTheoGio/UvKnlv");
const ViecLam = require("../../models/ViecLamTheoGio/ViecLam");
const CaLamViec = require("../../models/ViecLamTheoGio/CaLamViec");
const UngTuyen = require("../../models/ViecLamTheoGio/UngTuyen");
const UvSaveVl = require("../../models/ViecLamTheoGio/UvSaveVl");
const NtdSaveUv = require("../../models/ViecLamTheoGio/NtdSaveUv");
const NtdXemUv = require("../../models/ViecLamTheoGio/NtdXemUv");
const XemUv = require("../../models/ViecLamTheoGio/XemUv");
const ThongBaoUv = require("../../models/ViecLamTheoGio/ThongBaoUv");
const ThongBaoNtd = require("../../models/ViecLamTheoGio/ThongBaoNtd");
const City = require("../../models/ViecLamTheoGio/City");
const functions = require("../../services/functions");
const dotenv = require("dotenv");
const { access } = require("fs");
const md5 = require("md5");
dotenv.config();
const folder_img = "user_ntd";

const bcrypt = require("bcrypt");

exports.register = async (req, res, next) => {
  try {
    console.log("Da vao day", req.body); // Kiểm tra request nhận được

    let { userName, email, password, repassword, type } = req.body;

    if (!(userName && email && password && repassword)) {
      return functions.setError(res, "Missing fields", 400);
    }

    if (password !== repassword) {
      return functions.setError(res, "Passwords do not match", 400);
    }

    let checkEmail = await Users.findOne({ email }).lean();
    if (checkEmail) return functions.setError(res, "Email already exists", 401);

    let maxId = await functions.getMaxIdByField(Users, "_id");
    let time = functions.convertTimestamp(Date.now());
    let diem_free = type == 1 ? 10 : 0;
    let otp = Math.floor(Math.random() * 1000000);

    // Hash password bằng bcrypt
    let hashedPassword = await bcrypt.hash(password, 10);

    await Promise.all([
      Users.create({
        _id: maxId,
        userName,
        email,
        password: hashedPassword, // Lưu mật khẩu đã hash
        type,
        diem_free,
        otp,
        createdAt: time,
      }),
      functions.sendEmailOTP(email, otp),
    ]);

    return functions.success(res, "Register success");
  } catch (error) {
    console.error("Lỗi trong quá trình đăng ký:", error); // In lỗi ra console để debug
    return functions.setError(res, error.message);
  }
};


exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    console.log("🔹 [LOGIN] Nhận request:", req.body);

    if (!email || !password) {
      console.log("❌ Thiếu email hoặc password");
      return functions.setError(res, "Missing fields", 400);
    }

    let user = await Users.findOne({ email });
    console.log("🔹 [LOGIN] Tìm user với email:", email);
    console.log("🔹 [LOGIN] Kết quả tìm user:", user);

    if (!user) {
      console.log("❌ Email không tồn tại:", email);
      return functions.setError(res, "Email not exists", 400);
    }

    console.log("🔹 [LOGIN] Kiểm tra password nhập vào:", password);
    console.log("🔹 [LOGIN] Mật khẩu trong database:", user.password);

    let checkPassword = await functions.verifyPassword(password, user.password);
    console.log("🔹 [LOGIN] Kết quả kiểm tra mật khẩu:", checkPassword);

    if (!checkPassword) {
      console.log("❌ Sai mật khẩu cho email:", email);
      return functions.setError(res, "Password incorrect", 400);
    }

    console.log("🔹 [LOGIN] Tạo token cho user:", user._id);
    const token = await functions.createToken(
      {
        _id: user._id,
        email: user.email,
        type: user.type,
        userName: user.userName,
      },
      "1d"
    );

    let refreshToken = await functions.createToken({ userId: user._id }, "1y");

    let data = {
      access_token: token,
      refresh_token: refreshToken,
      type: user.type,
    };

    console.log("✅ [LOGIN] Đăng nhập thành công:", data);
    return functions.success(res, "Login success", { data });

  } catch (error) {
    console.log("❌ [LOGIN] Lỗi trong quá trình đăng nhập:", error);
    return functions.setError(res, error.message);
  }
};


exports.changePassword = async (req, res, next) => {
  try {
    // console.log("req:::", req.body);
    let id = req.user.data._id;
    let { oldpassword, password } = req.body;
    if (oldpassword && password) {
      let user = await Users.findOne({ _id: id });
      if (user) {
        let checkPassword = await functions.verifyPassword(
          oldpassword,
          user.password
        );
        if (checkPassword) {
          let newPassword = md5(password);
          await Users.findOneAndUpdate({ _id: id }, { password: newPassword });
          return functions.success(res, "Change password success");
        }
        return functions.setError(res, "Password incorrect", 400);
      }
    }
  } catch (error) {
    console.log("err:", error);
    return functions.setError(res, error.message);
  }
};

exports.setPassword = async (req, res, next) => {
  try {
    let id = req?.user?.data?._id;
    let { password, email } = req.body;
    if (!id && !email) return functions.setError(res, "Missing fields", 404);
    if (email) {
      await Users.findOneAndUpdate(
        { email: email },
        { password: md5(password) }
      );
      return functions.success(res, "Set password success");
    }
    await Users.findOneAndUpdate({ _id: id }, { password: md5(password) });
    return functions.success(res, "Set password success");
  } catch (error) {
    console.log("err:", error);
    return functions.setError(res, error.message);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    let { email } = req.body;
    if (email) {
      let user = await Users.findOne({ email: email });
      if (user) {
        let newPassword = functions.randomNumber;
        console.log("new", newPassword);
        return functions.success(res, "Forgot password success", {
          password: newPassword,
        });
      }
      return functions.setError(res, "Email not exists", 401);
    }
    return functions.setError(res, "Missing fields", 400);
  } catch (error) {
    console.log("err:", error);
    return functions.setError(res, error.message);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    let { email, newPassword } = req.body;
    if (email) {
      let user = await Users.findOne({ email: email });
      if (user) {
        user.password = md5(newPassword);
        await user.save();
        return functions.success(res, "Forgot password success");
      }
      return functions.setError(res, "Email not exists", 401);
    }
    return functions.setError(res, "Missing fields", 400);
  } catch (error) {
    console.log("err:", error);
    return functions.setError(res, error.message);
  }
};

exports.danhSachTinTuyenDungMoi = async (req, res, next) => {
  try {
    let id_ntd = req.user.data._id;
    let type = req.user.data.type;
    if (type == 1) {
      let { page, pageSize } = req.body;
      if (!page) page = 1;
      if (!pageSize) pageSize = 6;
      page = Number(page);
      pageSize = Number(pageSize);
      const skip = (page - 1) * pageSize;
      let time = functions.convertTimestamp(Date.now());
      let today = time;
      time = time - 86400;
      let count_vlhh = 0;
      let count_vlshh = 0;
      let count_vltn = 0;
      let count_vlch = 0;
      let viecLam = await ViecLam.find(
        { id_ntd: id_ntd },
        {
          id_vieclam: 1,
          vi_tri: 1,
          alias: 1,
          fist_time: 1,
          last_time: 1,
          time_td: 1,
        }
      )
        .sort({ id_vieclam: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean();
      for (let i = 0; i < viecLam.length; i++) {
        if (viecLam.vl_created_time > today) count_vltn++;
        if (viecLam.time_td >= today) count_vlch++;
        else count_vlhh;
        if (viecLam.time_td - today < 172800 && viecLam.time_td - today > 0)
          count_vlshh++;
      }
      return functions.success(res, "Danh sach tin tuyen dung moi nhat", {
        data: viecLam,
      });
    }
    return functions.setError(res, "Not company", 403);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.quanLyChung = async (req, res, next) => {
  try {
    // console.log("req:::", req.body);
    let id_ntd = req.user.data._id;
    let type = req.user.data.type;
    if (type == 1) {
      let { page, pageSize } = req.body;
      if (!page) page = 1;
      if (!pageSize) pageSize = 6;
      page = Number(page);
      pageSize = Number(pageSize);
      const skip = (page - 1) * pageSize;
      const currentDate = new Date();
      let time = functions.convertTimestamp(Date.now());
      let today = currentDate.setHours(0, 0, 0, 0);
      today = functions.convertTimestamp(today);
      time = time - 86400;
      let count_vlhh = 0;
      let count_vlshh = 0;
      let count_vltn = 0;
      let count_vlch = 0;
      let totalViecLam = await functions.findCount(ViecLam, { id_ntd: id_ntd });

      //lay ra tin tuyen dung moi nhat
      let viecLamMoiNhat = await ViecLam.find(
        { id_ntd: id_ntd },
        {
          id_vieclam: 1,
          vi_tri: 1,
          alias: 1,
          fist_time: 1,
          last_time: 1,
          time_td: 1,
        }
      )
        .sort({ id_vieclam: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean();

      for (let i = 0; i < viecLamMoiNhat.length; i++) {
        let totalUnnTuyen = await UngTuyen.distinct("id_viec", {
          id_viec: viecLamMoiNhat[i].id_vieclam,
        });
        viecLamMoiNhat[i].totalUnnTuyen = totalUnnTuyen.length;
      }
      let viecLam = await ViecLam.find({ id_ntd: id_ntd });
      for (let i = 0; i < viecLam.length; i++) {
        if (viecLam[i].vl_created_time >= time) count_vltn++;
        if (viecLam[i].time_td >= today) count_vlch++;
        else count_vlhh++;
        if (
          today - viecLam[i].last_time < 172800 &&
          today - viecLam[i].last_time > 0
        )
          count_vlshh++;

        //lay ra luot ung tuyen
        let luotUngTuyen = await UngTuyen.distinct("id_viec", {
          id_viec: viecLam[i].id_vieclam,
        });
        viecLam[i].luotUngTuyen = luotUngTuyen.length;
      }
      //ung vien ung tuyen moi nhat
      let hoSoUngTuyen = await UngTuyen.aggregate([
        { $match: { id_ntd: id_ntd } },
        { $group: { _id: "$id_viec", firstUngTuyen: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$firstUngTuyen" } },
        { $sort: { id_ungtuyen: -1 } },
        { $limit: 4 },
        {
          $lookup: {
            from: "VLTG_ViecLam",
            localField: "id_viec",
            foreignField: "id_vieclam",
            as: "ViecLam",
          },
        },
        { $unwind: { path: "$ViecLam", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "Users",
            localField: "id_uv",
            foreignField: "_id",
            pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 0 } }],
            as: "UngVien",
          },
        },
        { $unwind: { path: "$UngVien", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id_ungtuyen: "$id_ungtuyen",
            uv_id: "$UngVien._id",
            uv_name: "$UngVien.userName",
            vl_id: "$ViecLam.id_vieclam",
            vl_vitri: "$ViecLam.vi_tri",
            vl_alias: "$ViecLam.alias",
            created_at: "$created_at",
          },
        },
      ]);
      let ntd = await Users.findOne({ _id: id_ntd, type: 1 }, { diem_free: 1 });
      let diem_free = 0;
      if (ntd) diem_free = ntd.diem_free;
      let totalHoSoUngTuyen = await UngTuyen.distinct("id_viec", {
        id_ntd: id_ntd,
      });
      totalHoSoUngTuyen = totalHoSoUngTuyen.length;
      let totalLocDiem = await functions.findCount(NtdXemUv, {
        id_ntd: id_ntd,
      });
      let info = {
        totalHoSoUngTuyen: totalHoSoUngTuyen,
        totalLocDiem: totalLocDiem,
        totalChuyenVienGuiUv: 0,
        totalViecLam: totalViecLam,
        vlSapHetHan: count_vlshh,
        vlHetHan: count_vlhh,
        vlConHan: count_vlch,
        vlTrongNgay: count_vltn,
        diemDocFree: diem_free,
      };
      return functions.success(res, "Danh sach tin tuyen dung moi nhat", {
        info,
        viecLamMoiNhat,
        hoSoUngTuyen,
      });
    }
    return functions.setError(res, "Not company", 403);
  } catch (error) {
    console.log("err:", error);
    return functions.setError(res, error.message);
  }
};

exports.danhSachUvTheoGio = async (req, res, next) => {
  try {
    let { page, pageSize, id_nganh, id_city } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 9;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let id_ntd = req.user && req.user.data ? req.user.data._id : null;
    // inforVLTG.uv_search
    let condition = {
      _id: { $nin: [null, 0] },
      type: 0,
      uv_search: 1,
    };
    let condition2 = {};
    if (id_nganh) condition2["CVMM.nganh_nghe"] = new RegExp(id_nganh, "i");
    if (id_city) condition.city = Number(id_city);
    let danhSachUngVien = await Users.aggregate([
      { $match: condition },
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "VLTG_UvCvmm",
          localField: "_id",
          foreignField: "id_uv_cvmm",
          as: "CVMM",
        },
      },
      { $unwind: { path: "$CVMM", preserveNullAndEmptyArrays: true } },
      { $match: condition2 },
      {
        $project: {
          _id: "$_id",
          _id: "$_id",
          district: "$district",
          city: "$city",
          userName: "$userName",
          phone: "$phone",
          address: "$address",
          avatarUser: "$avatarUser",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          uv_cvmm: "$CVMM.cong_viec",
        },
      },
    ]);
    //kiem tra ntd da xem, luu ung vien chua
    for (let i = 0; i < danhSachUngVien.length; i++) {
      let check_ntd_xem_uv = false;
      let check_xem_uv = false;
      let check_ntd_save_uv = false;
      let id_uv = danhSachUngVien[i]._id;

      //dung diem loc de xem
      let ntd_xem_uv = await NtdXemUv.findOne({ id_ntd: id_ntd, id_uv: id_uv });
      if (ntd_xem_uv) check_ntd_xem_uv = true;

      let ntd_save_uv = await NtdSaveUv.findOne({
        id_ntd: id_ntd,
        id_uv: id_uv,
      });
      if (ntd_save_uv) check_ntd_save_uv = true;

      let xem_uv = await XemUv.findOne({ xm_id_ntd: id_ntd, xm_id_uv: id_uv });
      if (xem_uv) check_xem_uv = true;

      danhSachUngVien[i].check_ntd_xem_uv = check_ntd_xem_uv;
      danhSachUngVien[i].check_xem_uv = check_xem_uv;
      danhSachUngVien[i].check_ntd_save_uv = check_ntd_save_uv;
    }
    let total = await Users.aggregate([
      { $match: condition },
      {
        $lookup: {
          from: "VLTG_UvCvmm",
          localField: "_id",
          foreignField: "id_uv_cvmm",
          as: "CVMM",
        },
      },
      { $unwind: { path: "$CVMM", preserveNullAndEmptyArrays: true } },
      { $match: condition2 },
      {
        $count: "count",
      },
    ]);
    total = total.length != 0 ? total[0].count : 0;
    return functions.success(res, "Lay ra danh sach thanh cong", {
      total,
      data: danhSachUngVien,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.thongKeUngVien = async (req, res, next) => {
  try {
    let condition = {
      _id: { $nin: [null, 0] },
      type: 0,
      uv_search: 1,
    };
    let totalHinhThuc = [];
    let listCandidate = await Users.aggregate([
      { $match: condition },
      {
        $lookup: {
          from: "VLTG_UvCvmm",
          localField: "_id",
          foreignField: "id_uv_cvmm",
          as: "CVMM",
        },
      },
      { $unwind: { path: "$CVMM", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$_id",
          _id: "$_id",
          district: "$district",
          city: "$city",
          userName: "$userName",
          phone: "$phone",
          phoneTK: "$phoneTK",
          address: "$address",
          avatarUser: "$avatarUser",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          uv_cong_viec: "$CVMM.cong_viec",
          uv_hinh_thuc: "$CVMM.hinh_thuc",
          uv_nganh_nghe: "$CVMM.nganh_nghe",
          uv_dia_diem: "$CVMM.dia_diem",
        },
      },
    ]);
    for (let i = 1; i <= 3; i++) {
      let total = listCandidate.filter((e) => e.uv_hinh_thuc == i).length;
      totalHinhThuc.push(total);
    }

    //ung vien theo nganh nghe
    let nganhNghe = await JobCategory.find(
      { jc_id: { $lt: 11 } },
      { jc_id: 1, jc_name: 1 }
    )
      .sort({ jc_id: 1 })
      .limit(10)
      .lean();
    for (let i = 0; i < nganhNghe.length; i++) {
      let total = listCandidate.filter((e) => {
        if (e.uv_nganh_nghe) {
          let arr_nn = e.uv_nganh_nghe.split(", ");
          let check = arr_nn.includes(String(nganhNghe[i].jc_id));
          if (check) return true;
        }
        return false;
      });
      nganhNghe[i].total = total.length;
    }
    //ung vien theo tinh thanh
    let totaTinhThanh = [];
    let tinhThanh = await City.find({}, { _id: 1, name: 1 }).lean();
    for (let i = 0; i < tinhThanh.length; i++) {
      let total = listCandidate.filter((e) => {
        if (e.uv_dia_diem) {
          let arr_dd = e.uv_dia_diem.split(", ");
          let check = arr_dd.includes(String(tinhThanh[i]._id));
          if (check) return true;
        }
        return false;
      });
      if (total.length < 1) continue;
      tinhThanh[i].total = total.length;
      totaTinhThanh.push(tinhThanh[i]);
    }
    return functions.success(
      res,
      "Thong ke ung vien theo hinh thuc, nganh nghe, tinh thanh",
      { totalHinhThuc, totaNganhNghe: nganhNghe, totaTinhThanh }
    );
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.thongKeDanhSachUngVien = async (req, res, next) => {
  try {
    let { page, pageSize, id_nganh, id_hinhthuc, id_city, key } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let condition = {
      _id: { $nin: [null, 0] },
      type: 0,
      uv_search: 1,
    };
    let condition2 = {};

    if (id_nganh) condition2["uv_nganh_nghe"] = new RegExp(`\\b${id_nganh}\\b`);
    if (id_hinhthuc) condition2["uv_hinh_thuc"] = Number(id_hinhthuc);
    if (id_city) condition2["uv_dia_diem"] = new RegExp(`\\b${id_city}\\b`);
    if (key) condition2["uv_cong_viec"] = new RegExp(key, "i");
    console.log("body::", req.body);
    console.log("condition2::", condition2);
    let danhSachUngVien = await Users.aggregate([
      { $match: condition },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "VLTG_UvCvmm",
          localField: "_id",
          foreignField: "id_uv_cvmm",
          as: "CVMM",
        },
      },
      { $unwind: { path: "$CVMM", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$_id",
          _id: "$_id",
          district: "$district",
          city: "$city",
          userName: "$userName",
          birthday: "$birthday",
          phone: "$phone",
          email: "$email",
          type: "$type",
          gender: "$gender",
          phoneTK: "$phoneTK",
          address: "$address",
          avatarUser: "$avatarUser",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          uv_cong_viec: "$CVMM.cong_viec",
          uv_hinh_thuc: "$CVMM.hinh_thuc",
          uv_nganh_nghe: "$CVMM.nganh_nghe",
          uv_dia_diem: "$CVMM.dia_diem",
        },
      },
      { $match: condition2 },
    ]);
    //kiem tra ntd da xem, luu ung vien chua
    let id_ntd = req.user && req.user.data ? req.user.data._id : null;
    for (let i = 0; i < danhSachUngVien.length; i++) {
      danhSachUngVien[i].linkAvatar = functions.getLinkFile(
        "user_uv",
        danhSachUngVien[i].createdAt,
        danhSachUngVien[i].avatarUser
      );
      let check_ntd_xem_uv = false;
      let check_xem_uv = false;
      let check_ntd_save_uv = false;
      let id_uv = danhSachUngVien[i]._id;

      let ntd_xem_uv = await NtdXemUv.findOne({ id_ntd: id_ntd, id_uv: id_uv });
      if (ntd_xem_uv) {
        check_ntd_xem_uv = true;
      } else {
        danhSachUngVien[i].email = "";
        danhSachUngVien[i].phone = "";
      }

      let ntd_save_uv = await NtdSaveUv.findOne({
        id_ntd: id_ntd,
        id_uv: id_uv,
      });
      if (ntd_save_uv) check_ntd_save_uv = true;

      let xem_uv = await XemUv.findOne({ xm_id_ntd: id_ntd, xm_id_uv: id_uv });
      if (xem_uv) check_xem_uv = true;

      //check nha tuyen dung xem ung vien
      // let check_xem_uv = false;
      // let ntd_xem_uv = await NtdXemUv.findOne({
      //   id_ntd: id_ntd,
      //   id_uv: id_uv,
      // });
      // if (ntd_xem_uv) {
      //   check_xem_uv = true;
      // } else {
      //   delete ungVien.email;
      //   delete ungVien.phone;
      // }

      // ungVien.check_xem_uv = check_xem_uv;

      danhSachUngVien[i].check_ntd_xem_uv = check_ntd_xem_uv;
      danhSachUngVien[i].check_xem_uv = check_xem_uv;
      danhSachUngVien[i].check_ntd_save_uv = check_ntd_save_uv;
    }
    let total = await Users.aggregate([
      { $match: condition },
      {
        $lookup: {
          from: "VLTG_UvCvmm",
          localField: "_id",
          foreignField: "id_uv_cvmm",
          as: "CVMM",
        },
      },
      { $unwind: { path: "$CVMM", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$_id",
          _id: "$_id",
          district: "$district",
          city: "$city",
          userName: "$userName",
          phone: "$phone",
          phoneTK: "$phoneTK",
          address: "$address",
          avatarUser: "$avatarUser",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          uv_cong_viec: "$CVMM.cong_viec",
          uv_hinh_thuc: "$CVMM.hinh_thuc",
          uv_nganh_nghe: "$CVMM.nganh_nghe",
          uv_dia_diem: "$CVMM.dia_diem",
        },
      },
      { $match: condition2 },
      {
        $count: "count",
      },
    ]);
    total = total.length != 0 ? total[0].count : 0;

    return functions.success(
      res,
      "Thong ke danh sach ung vien theo hinh thuc, nganh nghe, tinh thanh",
      { total, data: danhSachUngVien }
    );
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.chiTietUngVien = async (req, res, next) => {
  try {
    let id_uv = req.body.id_uv;
    // console.log("id_uv::", id_uv);
    let time = functions.convertTimestamp(Date.now());
    if (id_uv) {
      id_uv = Number(id_uv);
      let id_ntd = null;
      if (req.user && req.user.data) id_ntd = req.user.data._id;
      let ungVien = await Users.findOne({ _id: id_uv, type: 0 });
      // console.log("ungVien::", ungVien);
      if (ungVien) {
        //cap nhat vao model XemUv
        let maxIdXemUv = await functions.getMaxIdByField(XemUv, "xm_id");
        let fieldXemUv = { xm_time_created: time };
        let xemUv = await XemUv.findOne({ xm_id_ntd: id_ntd, xm_id_uv: id_uv });
        if (!xemUv) {
          fieldXemUv = {
            ...fieldXemUv,
            xm_id: maxIdXemUv,
            xm_id_ntd: id_ntd,
            xm_id_uv: id_uv,
          };
        }
        await XemUv.findOneAndUpdate(
          { xm_id_ntd: id_ntd, xm_id_uv: id_uv },
          fieldXemUv,
          { new: true, upsert: true }
        );
        //cap nhat luot xem
        let luot_xem = ungVien.luot_xem;
        luot_xem++;
        await Users.findOneAndUpdate(
          { _id: id_uv, type: 0 },
          { luot_xem: luot_xem },
          { new: true }
        );

        //lay ra thong tin ung vien
        ungVien = await Users.aggregate([
          { $match: { _id: id_uv, type: 0 } },
          {
            $lookup: {
              from: "VLTG_UvCvmm",
              localField: "_id",
              foreignField: "id_uv_cvmm",
              as: "CVMM",
            },
          },
          { $unwind: { path: "$CVMM", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "VLTG_UvKnlv",
              localField: "_id",
              foreignField: "id_uv_knlv",
              as: "KNLV",
            },
          },
          {
            $project: {
              _id: "$_id",
              _id: "$_id",
              district: "$district",
              city: "$city",
              userName: "$userName",
              phone: "$phone",
              address: "$address",
              email: "$email",
              avatarUser: "$avatarUser",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
              birthday: "$birthday",
              gender: "$gender",
              married: "$married",
              experience: "$experience",
              education: "$education",
              uv_day: "$uv_day",
              uv_search: "$uv_search",
              luot_xem: "$luot_xem",
              diem_free: "$diem_free",
              diem_mua: "$diem_mua",
              uv_cong_viec: "$CVMM.cong_viec",
              uv_nganh_nghe: "$CVMM.nganh_nghe",
              uv_dia_diem: "$CVMM.dia_diem",
              uv_lever: "$CVMM.lever",
              uv_hinh_thuc: "$CVMM.hinh_thuc",
              uv_luong: "$CVMM.luong",
              uv_ky_nang: "$CVMM.ky_nang",
              KNLV: "$KNLV",
            },
          },
        ]);
        ungVien = ungVien[0];
        //lay ra ten nganh nghe
        let arrNameNN = [];
        let nganhNghe = ungVien.uv_nganh_nghe;
        if (nganhNghe) {
          nganhNghe = nganhNghe.split(", ");
          for (let i = 0; i < nganhNghe.length; i++) {
            let nameNN = await JobCategory.findOne(
              { jc_id: Number(nganhNghe[i]) },
              { jc_id: 1, jc_name: 1 }
            );
            if (nameNN) arrNameNN.push(nameNN);
          }
        }
        ungVien.arrNameNN = arrNameNN;
        ungVien.linkAvatar = functions.getLinkFile(
          "user_uv",
          ungVien.createdAt,
          ungVien.avatarUser
        );

        //lay ra danh sach ung vien lien quan
        let condition = { _id: { $nin: [null, 0, id_uv] }, type: 0 };

        let condition2 = {};
        if (nganhNghe) {
          condition2 = {
            "CVMM.nganh_nghe": new RegExp(`\\b${nganhNghe[0]}\\b`),
          };
        }
        let listUVLienQuan = await Users.aggregate([
          { $match: condition },
          { $sort: { _id: -1 } },
          { $limit: 6 },
          {
            $lookup: {
              from: "VLTG_UvCvmm",
              localField: "_id",
              foreignField: "id_uv_cvmm",
              as: "CVMM",
            },
          },
          { $unwind: { path: "$CVMM", preserveNullAndEmptyArrays: true } },
          { $match: condition2 },
          {
            $project: {
              _id: "$_id",
              _id: "$_id",
              district: "$district",
              city: "$city",
              userName: "$userName",
              phone: "$phone",
              phoneTK: "$phoneTK",
              address: "$address",
              avatarUser: "$avatarUser",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
              uv_cong_viec: "$CVMM.cong_viec",
              uv_nganh_nghe: "$CVMM.nganh_nghe",
            },
          },
        ]);

        //check nha tuyen tuyen dung luu ung vien
        let check_save_uv = false;
        let ntd_save_uv = await NtdSaveUv.findOne({
          id_ntd: id_ntd,
          id_uv: id_uv,
        });

        if (ntd_save_uv) check_save_uv = true;
        ungVien.check_save_uv = check_save_uv;

        //check nha tuyen dung xem ung vien
        let check_xem_uv = false;
        let ntd_xem_uv = await NtdXemUv.findOne({
          id_ntd: id_ntd,
          id_uv: id_uv,
        });
        if (ntd_xem_uv) {
          check_xem_uv = true;
        } else {
          delete ungVien.email;
          delete ungVien.phone;
        }

        ungVien.check_xem_uv = check_xem_uv;

        // console.log("ungVien::", ungVien);
        return functions.success(res, "Xem chi tiet ung vien thanh cong", {
          data: ungVien,
          listUVLienQuan,
        });
      }
      return functions.setError(res, "Ung vien not found!", 404);
    }
    return functions.setError(res, "Missing input id_uv!", 405);
  } catch (error) {
    console.log("error::", error);
    return functions.setError(res, error.message);
  }
};

exports.dangTin = async (req, res, next) => {
  try {
    let id_ntd = req?.user?.data._id;
    let type = req.user.data.type;
    if (type == 1) {
      let time = functions.convertTimestamp(Date.now());
      let time10p = time - 600;
      let viecLam1 = await ViecLam.find({
        id_ntd: id_ntd,
        vl_created_time: { $gte: time10p },
      });
      let viecLam2 = await ViecLam.find({
        id_ntd: id_ntd,
        vl_created_time: { $gte: time },
      });
      let vi_tri = req.body.vi_tri;
      if (!vi_tri) return functions.setError(res, "Missing input vi_tri!", 405);
      let list_ca = req.body.list_ca;
      if (!list_ca || list_ca.length <= 0)
        return functions.setError(res, "Missing input value list_ca!", 406);
      let checkTrungTitle = await ViecLam.findOne({
        id_ntd: id_ntd,
        vi_tri: vi_tri,
      });
      console.log("body", req.body);
      // console.log("id_ntd>>", id_ntd);
      // console.log("checkTrungTitle>>", checkTrungTitle);
      if (!checkTrungTitle) {
        if (viecLam1.length <= 0 && viecLam2.length <= 24) {
          let {
            nganh_nghe,
            dia_diem,
            quan_huyen,
            cap_bac,
            hinh_thuc,
            ht_luong, //co dinh or uoc luong
            tra_luong, //hình thức trả lương
            luong,
            luong_first,
            luong_last,
            thoi_gian,
            hoa_hong,
            so_luong,
            hoc_van,
            time_td,
            fist_time,
            last_time,
            alias,
            mo_ta,
            gender,
            yeu_cau,
            quyen_loi,
            ho_so,
            name_lh,
            phone_lh,
            address_lh,
            email_lh,
            address,
          } = req.body;

          let fieldCheck = [
            vi_tri,
            dia_diem,
            hinh_thuc,
            ht_luong,
            tra_luong,
            hoc_van,
            so_luong,
            nganh_nghe,
            cap_bac,
            time_td,
            fist_time,
            last_time,
            mo_ta,
            gender,
            yeu_cau,
            quyen_loi,
            ho_so,
            name_lh,
            phone_lh,
            address_lh,
          ];

          for (let i = 0; i < fieldCheck.length; i++) {
            if (!fieldCheck[i]) {
              return functions.setError(
                res,
                `Missing input value ${i + 1}`,
                405
              );
            }
          }
          if (
            functions.checkDate(time_td) &&
            functions.checkDate(fist_time) &&
            functions.checkDate(last_time)
          ) {
            if (functions.checkPhoneNumber(phone_lh)) {
              alias = functions.renderAlias(vi_tri);
              time_td = functions.convertDateToTimestamp(time_td);
              if (time_td < time)
                return functions.setError(res, "time_td must >= time now", 400);
              let muc_luong;
              if (ht_luong == 1) {
                muc_luong = luong;
              } else {
                muc_luong = `${luong_first} - ${luong_last}`;
              }
              let maxId = await functions.getMaxIdByField(
                ViecLam,
                "id_vieclam"
              );

              console.log("time_td", time_td);
              let viecLam = new ViecLam({
                id_vieclam: maxId,
                id_ntd: id_ntd,
                vi_tri,
                nganh_nghe,
                dia_diem,
                quan_huyen,
                cap_bac,
                hinh_thuc,
                ht_luong,
                tra_luong,
                muc_luong,
                luong,
                luong_first,
                luong_last,
                thoi_gian,
                hoa_hong,
                so_luong,
                hoc_van,
                time_td,
                fist_time,
                last_time,
                alias,
                mo_ta,
                gender,
                yeu_cau,
                quyen_loi,
                ho_so,
                luot_xem: 0,
                name_lh,
                phone_lh,
                address_lh,
                email_lh,
                vl_created_time: time,
                active: 1,
                created_at: time,
                address,
              });

              //them vao model ca lam viec

              if (list_ca && list_ca.length > 0) {
                for (let i = 0; i < list_ca.length; i++) {
                  let day = list_ca[i].day;
                  let ca_start_time = list_ca[i].ca_start_time;
                  let ca_end_time = list_ca[i].ca_end_time;
                  day = day.join(`, ${i + 1}`);
                  day = `${i + 1}${day}`;
                  let maxIdCaLamViec = await functions.getMaxIdByField(
                    CaLamViec,
                    "ca_id"
                  );
                  let caLamViec = new CaLamViec({
                    ca_id: maxIdCaLamViec,
                    ca_id_viec: maxId,
                    ca_start_time: ca_start_time,
                    ca_end_time: ca_end_time,
                    day: day,
                  });
                  await caLamViec.save();
                }
                //
                viecLam = await viecLam.save();
                return functions.success(res, "Dang tin thnh cong!");
              }
              return functions.setError(
                res,
                "Missing input value list_ca!",
                400
              );
            }
            return functions.setError(res, "Invalid phone", 406);
          }
          return functions.setError(res, "Invalid date", 406);
        }
        return functions.setError(
          res,
          "Mỗi tin của bạn cần đăng cách nhau 10 phút tối đa 24 tin/ngày!",
          411
        );
      }
      return functions.setError(res, "Title bi trung!", 410);
    }
    return functions.setError(res, "Not company", 403);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.danhSachTinDaDang = async (req, res, next) => {
  try {
    let { page, pageSize, id_viec } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 6;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let id_ntd = req.user.data._id;
    let condition = { id_ntd: id_ntd };
    if (id_viec) condition.id_vieclam = Number(id_viec);
    let total = await functions.findCount(ViecLam, condition);
    let danhSachViecLam = await functions.pageFindWithFields(
      ViecLam,
      condition,
      {
        id_vieclam: 1,
        vi_tri: 1,
        alias: 1,
        dia_diem: 1,
        nganh_nghe: 1,
        luot_xem: 1,
        time_td: 1,
        fist_time: 1,
        last_time: 1,
        active: 1,
      },
      { time_td: -1 },
      skip,
      pageSize
    );
    // console.log("danhSachViecLam>>", danhSachViecLam);
    for (let i = 0; i < danhSachViecLam.length; i++) {
      let jc_id = Number(danhSachViecLam[i].nganh_nghe);
      let nganhNghe = await JobCategory.findOne(
        { jc_id: jc_id },
        { jc_id: 1, jc_name: 1 }
      );
      if (nganhNghe) danhSachViecLam[i].nganhNghe = nganhNghe;
      let totalUngTuyen = await UngTuyen.distinct("id_viec", {
        id_viec: danhSachViecLam[i].id_vieclam,
      });
      danhSachViecLam[i].totalUngTuyen = totalUngTuyen.length;
    }
    return functions.success(res, "danh sach tin da dang", {
      total,
      data: danhSachViecLam,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.suaTin = async (req, res, next) => {
  try {
    let id_ntd = req.user.data._id;
    let type = req.user.data.type;
    if (type == 1) {  
      let time = functions.convertTimestamp(Date.now());
      let {
        id_vieclam,
        nganh_nghe,
        dia_diem,
        quan_huyen,
        cap_bac,
        hinh_thuc,
        ht_luong, //co dinh or uoc luong
        tra_luong, //hình thức trả lương
        luong,
        luong_first,
        luong_last,
        thoi_gian,
        hoa_hong,
        so_luong,
        hoc_van,
        time_td,
        fist_time,
        last_time,
        alias,
        mo_ta,
        gender,
        yeu_cau,
        quyen_loi,
        ho_so,
        name_lh,
        phone_lh,
        address_lh,
        email_lh,
        vi_tri,
      } = req.body;
      if (id_vieclam) {
        id_vieclam = Number(id_vieclam);
        let fieldCheck = [
          vi_tri,
          dia_diem,
          hinh_thuc,
          ht_luong,
          tra_luong,
          hoc_van,
          so_luong,
          nganh_nghe,
          cap_bac,
          time_td,
          fist_time,
          last_time,
          mo_ta,
          gender,
          yeu_cau,
          quyen_loi,
          ho_so,
          name_lh,
          phone_lh,
          address_lh,
        ];

        for (let i = 0; i < fieldCheck.length; i++) {
          if (!fieldCheck[i]) {
            return functions.setError(res, `Missing input value ${i + 1}`, 405);
          }
        }
        if (
          functions.checkDate(time_td) &&
          functions.checkDate(fist_time) &&
          functions.checkDate(last_time)
        ) {
          if (functions.checkPhoneNumber(phone_lh)) {
            alias = functions.renderAlias(vi_tri);
            time_td = functions.convertTimestamp(time_td);
            let muc_luong;
            if (ht_luong == 1) {
              muc_luong = luong;
            } else {
              muc_luong = `${luong_first} - ${luong_last}`;
            }
            console.log("luong_first:::", luong_first);
            console.log("luong:::", luong);
            let viecLam = await ViecLam.findOneAndUpdate(
              { id_vieclam: id_vieclam },
              {
                id_ntd: id_ntd,
                vi_tri,
                nganh_nghe,
                dia_diem,
                quan_huyen,
                cap_bac,
                hinh_thuc,
                ht_luong,
                tra_luong,
                muc_luong,
                luong,
                luong_first,
                luong_last,
                thoi_gian,
                hoa_hong,
                so_luong,
                hoc_van,
                time_td,
                fist_time,
                last_time,
                alias,
                mo_ta,
                gender,
                yeu_cau,
                quyen_loi,
                ho_so,
                name_lh,
                phone_lh,
                address_lh,
                email_lh,
                created_at: time,
              },
              { new: true }
            );
            //
            if (!viecLam) functions.setError(res, "Viec lam not found!", 404);

            //them vao model ca lam viec
            let caLamViec = await CaLamViec.deleteMany({
              ca_id_viec: id_vieclam,
            });

            //them vao model ca lam viec
            let list_ca = req.body.list_ca;
            if (list_ca && list_ca.length > 0) {
              for (let i = 0; i < list_ca.length; i++) {
                let day = list_ca[i].day;
                let ca_start_time = list_ca[i].ca_start_time;
                let ca_end_time = list_ca[i].ca_end_time;
                day = day.join(`, ${i + 1}`);
                day = `${i + 1}${day}`;
                let maxIdCaLamViec = await functions.getMaxIdByField(
                  CaLamViec,
                  "ca_id"
                );
                let caLamViec = new CaLamViec({
                  ca_id: maxIdCaLamViec,
                  ca_id_viec: id_vieclam,
                  ca_start_time: ca_start_time,
                  ca_end_time: ca_end_time,
                  day: day,
                });
                await caLamViec.save();
              }
              return functions.success(res, "Sua tin thnh cong!");
            }
            return functions.setError(res, "Missing input value list_ca!", 400);
          }
          return functions.setError(res, "Invalid phone", 406);
        }
        return functions.setError(res, "Invalid date", 406);
      }
      return functions.setError(res, "Missing input id_vieclam!", 400);
    }
    return functions.setError(res, "Not company", 403);
  } catch (error) {
    console.log("error", error);
    return functions.setError(res, error.message);
  }
};

exports.lamMoiTin = async (req, res, next) => {
  try {
    let id_vieclam = req.body.id_vieclam;
    if (id_vieclam) {
      let time = functions.convertTimestamp(Date.now());
      let viecLam = await ViecLam.findOneAndUpdate(
        { id_vieclam: Number(id_vieclam) },
        { created_at: time },
        { new: true }
      );
      if (viecLam) {
        return functions.success(res, "Lam moi tin thanh cong");
      }
      return functions.setError(res, "Viec lam not found!", 404);
    }
    return functions.setError(res, "Missing input id_vieclam", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.ungVienMoiUngTuyen = async (req, res, next) => {
  try {
    let { page, pageSize, status } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 6;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let id_ntd = req.user.data._id;
    let condition = { id_ntd: id_ntd };
    let condition2 = { UngVien: { $ne: [] } };
    let condition3 = { id_ntd: id_ntd };
    if (status) {
      condition2["UngTuyen.status"] = Number(status);
      condition3.status = Number(status);
    }
    let ungVienMoiUngTuyen = await ViecLam.aggregate([
      { $match: condition },
      {
        $lookup: {
          from: "VLTG_UngTuyen",
          localField: "id_vieclam",
          foreignField: "id_viec",
          as: "UngTuyen",
        },
      },
      {
        $lookup: {
          from: "Users",
          localField: "UngTuyen.id_uv",
          foreignField: "_id",
          pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 0 } }],
          as: "UngVien",
        },
      },
      { $match: condition2 },
      { $unwind: { path: "$UngVien", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          uv_id: "$UngVien._id",
          uv_userName: "$UngVien.userName",
          uv_phone: "$UngVien.phone",
          uv_city: "$UngVien.city",
          uv_address: "$UngVien.address",
          id_vieclam: "$id_vieclam",
          vl_vitri: "$vi_tri",
          vl_alias: "$alias",
          UngTuyen: "$UngTuyen",
        },
      },
      { $sort: { "UngTuyen.id_ungtuyen": -1 } },
      { $skip: skip },
      { $limit: pageSize },
    ]);
    // let total = await functions.findCount(UngTuyen, condition3);
    let total = await UngTuyen.distinct("id_uv", condition3);
    total = total.length;
    return functions.success(res, "danh sach ung vien moi ung tuyen", {
      total,
      data: ungVienMoiUngTuyen,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateStatusUngTuyen = async (req, res, next) => {
  try {
    let { id_viec, id_uv, status } = req.body;
    let id_ntd = req.user.data._id;
    if (id_viec && id_uv) {
      id_viec = Number(id_viec);
      id_uv = Number(id_uv);
      let ungTuyen = await UngTuyen.updateMany(
        { id_viec: id_viec, id_uv: id_uv, id_ntd: id_ntd },
        { status: status }
      );
      if (ungTuyen && ungTuyen.matchedCount > 0) {
        let [ntd, viecLam, ungVien] = await Promise.all([
          Users.findOne({ _id: id_ntd, type: 1 }),
          ViecLam.findOne({ id_vieclam: id_viec }),
          Users.findOne({ _id: id_uv, type: 0 }),
        ]);
        if (status == 3) {
          await functions.sendEmailUvChuaPhuHop(ntd, ungVien, viecLam);
        } else if (status == 2) {
          await functions.sendEmailUvPhuHop(ntd, ungVien, viecLam);
        }
        return functions.success(res, "Update status ung tuyen thanh cong");
      }
      return functions.setError(res, "Ung tuyen not found!", 404);
    }
    return functions.setError(res, "Missing input value", 405);
  } catch (error) {
    console.log("error::", error);
    return functions.setError(res, error.message);
  }
};

exports.updateGhiChuUngTuyen = async (req, res, next) => {
  try {
    let { id_viec, id_uv, ghi_chu } = req.body;
    let id_ntd = req.user.data._id;
    if (id_viec && id_uv) {
      id_viec = Number(id_viec);
      id_uv = Number(id_uv);
      let ungTuyen = await UngTuyen.updateMany(
        { id_viec: id_viec, id_uv: id_uv, id_ntd: id_ntd },
        { ghi_chu: ghi_chu }
      );
      if (ungTuyen && ungTuyen.matchedCount > 0) {
        return functions.success(res, "Update chi chu ung tuyen thanh cong");
      }
      return functions.setError(res, "Ung tuyen not found!", 404);
    }
    return functions.setError(res, "Missing input value", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//ung vien tu diem loc
exports.ungVienTuDiemLoc = async (req, res, next) => {
  try {
    let { page, pageSize, ket_qua } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 6;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let id_ntd = req.user.data._id;
    let condition = { id_ntd: id_ntd };
    if (ket_qua) condition.ket_qua = Number(ket_qua);
    let ungVienTuDiemLoc = await NtdXemUv.aggregate([
      { $match: condition },
      { $sort: { stt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "Users",
          localField: "id_uv",
          foreignField: "_id",
          pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 0 } }],
          as: "UngVien",
        },
      },
      { $unwind: { path: "$UngVien", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          stt: "$stt",
          id_ntd: "$id_ntd",
          id_uv: "$id_uv",
          ket_qua: "$ket_qua",
          ghi_chu: "$ghi_chu",
          time_created: "$time_created",
          uv_userName: "$UngVien.userName",
          uv_phone: "$UngVien.phone",
          uv_city: "$UngVien.city",
          uv_address: "$UngVien.address",
          uv_day: "$UngVien.uv_day",
        },
      },
    ]);
    let total = await functions.findCount(NtdXemUv, condition);
    return functions.success(res, "danh sach ung vien moi ung tuyen", {
      total,
      data: ungVienTuDiemLoc,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateKetQuaNtdXemUv = async (req, res, next) => {
  try {
    let { stt, ket_qua } = req.body;
    if (stt) {
      stt = Number(stt);
      let ntdXemUv = await NtdXemUv.findOneAndUpdate(
        { stt: stt },
        { ket_qua: ket_qua }
      );
      if (ntdXemUv) {
        return functions.success(
          res,
          "Update ket_qua nha tuyen dung xem ung vien thanh cong"
        );
      }
      return functions.setError(res, "NtdXemUv not found!", 404);
    }
    return functions.setError(res, "Missing input stt", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateGhiChuNtdXemUv = async (req, res, next) => {
  try {
    let { stt, ghi_chu } = req.body;
    if (stt) {
      stt = Number(stt);
      let ntdXemUv = await NtdXemUv.findOneAndUpdate(
        { stt: stt },
        { ghi_chu: ghi_chu }
      );
      if (ntdXemUv) {
        return functions.success(
          res,
          "Update chi chu nha tuyen dung xem ung vien thanh cong"
        );
      }
      return functions.setError(res, "NtdXemUv not found!", 404);
    }
    return functions.setError(res, "Missing input stt", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.getDiem = async (req, res, next) => {
  try {
    let id_ntd = req.user.data._id;
    let ntd = await Users.findOne({ _id: id_ntd, type: 1 });
    if (ntd) {
      return functions.success(res, "Get diem thanh cong", { data: ntd });
    }
    return functions.setError(res, "Nha tuyen dung not found!", 404);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.ntdXemUv = async (req, res, next) => {
  try {
    let id_ntd = req.user.data._id;
    let ntd = await Users.findOne({ _id: id_ntd, type: 1 });
    let id_uv = req.body.id_uv;
    if (ntd && id_uv) {
      id_uv = Number(id_uv);
      let ungVien = await Users.findOne({ _id: id_uv, type: 0 });
      if (ungVien) {
        let check = await NtdXemUv.findOne({ id_ntd: id_ntd, id_uv: id_uv });
        if (check)
          return functions.setError(
            res,
            "Nha tuyen dung da xem tt cua ung vien!"
          );
        let time = functions.convertTimestamp(Date.now());
        let diem_free = 0;
        let diem_mua = 0;
        diem_free = ntd.diem_free;
        diem_mua = ntd.diem_mua;
        let diem_t = diem_free + diem_mua;
        if (diem_t > 0) {
          if (diem_free > 0) {
            diem_free -= 1;
            await Users.findOneAndUpdate(
              { _id: id_ntd, type: 1 },
              { diem_free: diem_free }
            );
          } else {
            diem_mua -= 1;
            await Users.findOneAndUpdate(
              { _id: id_ntd, type: 1 },
              { diem_mua: diem_mua }
            );
          }
          //
          let maxId = await functions.getMaxIdByField(NtdXemUv, "stt");
          let ntdXemUv = new NtdXemUv({
            stt: maxId,
            id_ntd: id_ntd,
            id_uv: id_uv,
            ket_qua: 1,
            time_created: time,
          });
          ntdXemUv = await ntdXemUv.save();
          if (ntdXemUv) {
            //them vao model thong bao
            let maxIdTb = await functions.getMaxIdByField(ThongBaoUv, "tb_id");
            let ntd_name = ntd.userName ? ntd.userName : "";
            let ntd_avatar = ntd.avatarUser ? ntd.avatarUser : "";
            let thongBao = new ThongBaoUv({
              tb_id: maxIdTb,
              tb_uv: id_uv,
              tb_ntd: id_ntd,
              tb_name: ntd_name,
              tb_avatar: ntd_avatar,
              created_at: time,
            });
            await thongBao.save();
            //gui mail
            await functions.sendEmailUv(ntd, ungVien);
            return functions.success(
              res,
              "Nha tuyen dung xem ung vien thanh cong!"
            );
          }
          return functions.setError(
            res,
            "Nha tuyen dung xem ung vien that bai!",
            500
          );
        }
        return functions.setError(res, "Nha tuyen dung khong du diem!", 400);
      }
      return functions.setError(res, "Ung vien not found!", 404);
    }
    return functions.setError(
      res,
      "Nha tuyen dung not found or missing input id_uv!",
      404
    );
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.congThemDiem = async (req, res, next) => {
  try {
    let id_ntd = req.user.data._id;
    let ntd = await Users.findOneAndUpdate(
      { _id: id_ntd, type: 1 },
      { diem_free: 100 },
      { new: true }
    );
    if (ntd) {
      return functions.success(res, "Cong diem thanh cong");
    }
    return functions.setError(res, "Nha tuyen dung not found!", 404);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//ung vien da xem
exports.ungVienDaXem = async (req, res, next) => {
  try {
    let { page, pageSize } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 6;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let id_ntd = req.user.data._id;
    let condition = { xm_id_ntd: id_ntd };
    let ungVienDaXem = await XemUv.aggregate([
      { $match: condition },
      { $sort: { xm_id: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "Users",
          localField: "xm_id_uv",
          foreignField: "_id",
          pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 0 } }],
          as: "UngVien",
        },
      },
      { $unwind: { path: "$UngVien", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          xm_id: "$xm_id",
          xm_id_ntd: "$xm_id_ntd",
          xm_id_uv: "$xm_id_uv",
          xm_time_created: "$xm_time_created",
          uv_userName: "$UngVien.userName",
          uv_city: "$UngVien.city",
          uv_address: "$UngVien.address",
          uv_birthday: "$UngVien.birthday",
          uv_day: "$UngVien.uv_day",
        },
      },
    ]);
    let total = await functions.findCount(XemUv, condition);
    return functions.success(res, "danh sach ung vien moi ung tuyen", {
      total,
      data: ungVienDaXem,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//xoa ung vien da xem
exports.xoaUngVienDaXem = async (req, res, next) => {
  try {
    let id = req.body.id;
    if (id) {
      id = Number(id);
      let xemUv = await XemUv.findOneAndDelete({ xm_id: id });
      if (xemUv) {
        return functions.success(
          res,
          "Xoa ung vien khoi danh sach thanh cong!"
        );
      }
      return functions.setError(res, "Ban ghi not found!", 404);
    }
    return functions.setError(res, "Missing input id", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//--------------ung vien da luu
exports.ungVienDaLuu = async (req, res, next) => {
  try {
    let { page, pageSize } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 6;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let id_ntd = req.user.data._id;
    let condition = { id_ntd: id_ntd };
    let ungVienDaLuu = await NtdSaveUv.aggregate([
      { $match: condition },
      { $sort: { id: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "Users",
          localField: "id_uv",
          foreignField: "_id",
          pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 0 } }],
          as: "UngVien",
        },
      },
      { $unwind: { path: "$UngVien", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: "$id",
          id_ntd: "$id_ntd",
          id_uv: "$id_uv",
          created_at: "$created_at",
          uv_userName: "$UngVien.userName",
          uv_city: "$UngVien.city",
          uv_address: "$UngVien.address",
          uv_phone: "$UngVien.phone",
          uv_birthday: "$UngVien.birthday",
          uv_day: "$UngVien.uv_day",
        },
      },
    ]);
    let total = await functions.findCount(NtdSaveUv, condition);
    for (let i = 0; i < ungVienDaLuu.length; i++) {
      let id_uv = ungVienDaLuu[i].id_uv;
      let ntdXemUv = await NtdXemUv.findOne({ id_ntd: id_ntd, id_uv: id_uv });
      let check_xem_uv = false;
      if (ntdXemUv) {
        check_xem_uv = true;
      } else {
        let phone = ungVienDaLuu[i].uv_phone;
        if (phone) phone = phone.substring(0, 4);
        ungVienDaLuu[i].uv_phone = phone;
      }
      ungVienDaLuu[i].check_xem_uv = check_xem_uv;
    }
    return functions.success(res, "danh sach ung vien moi ung tuyen", {
      total,
      data: ungVienDaLuu,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//xoa ung vien da luu
exports.xoaUngVienDaLuu = async (req, res, next) => {
  try {
    let id_uv = req.body.id_uv;
    let id_ntd = req.user.data._id;
    if (id_uv && id_ntd) {
      id_uv = Number(id_uv);
      let ntdSaveUv = await NtdSaveUv.findOneAndDelete({
        id_uv: id_uv,
        id_ntd: id_ntd,
      });
      if (ntdSaveUv) {
        return functions.success(
          res,
          "Xoa ung vien khoi danh sach thanh cong!"
        );
      }
      return functions.setError(res, "Ban ghi not found!", 404);
    }
    return functions.setError(res, "Missing input", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.ntdSaveUv = async (req, res, next) => {
  try {
    let id_ntd = req.user.data._id;
    let id_uv = req.body.id_uv;
    if (id_uv) {
      id_uv = Number(id_uv);
      let ntd = await Users.findOne({ _id: id_ntd, type: 1 });
      let ungVien = await Users.findOne({ _id: id_uv, type: 0 });
      if (ntd && ungVien) {
        let check_save = await NtdSaveUv.findOne({
          id_ntd: id_ntd,
          id_uv: id_uv,
        });
        if (!check_save) {
          let maxId = await functions.getMaxIdByField(NtdSaveUv, "id");
          let ntdSaveUv = new NtdSaveUv({
            id: maxId,
            id_ntd: id_ntd,
            id_uv: id_uv,
            created_at: Date.now(),
          });
          ntdSaveUv = await ntdSaveUv.save();
          if (ntdSaveUv) {
            //them vao model thong bao
            let maxIdTb = await functions.getMaxIdByField(ThongBaoUv, "tb_id");
            let ntd_name = ntd.userName ? ntd.userName : "";
            let ntd_avatar = ntd.avatarUser ? ntd.avatarUser : "";
            let time = functions.convertTimestamp(Date.now());
            let thongBao = new ThongBaoUv({
              tb_id: maxIdTb,
              tb_uv: id_uv,
              tb_ntd: id_ntd,
              tb_name: ntd_name,
              tb_avatar: ntd_avatar,
              created_at: time,
            });
            await thongBao.save();
            return functions.success(
              res,
              "Nha tuyen dung luu ung vien thanh cong!"
            );
          }
          return functions.setError(res, "Ntd luu ung vien that bai", 405);
        }
        return functions.setError(res, "Ung vien da duoc luu!", 400);
      }
      return functions.setError(
        res,
        "Nha tuyen dung or Ung vien khong ton tai",
        404
      );
    }
    return functions.setError(res, "Missing input id_uv", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.getThongBaoNtd = async (req, res, next) => {
  try {
    let $id_ntd = req.user.data._id;
    let thongBao = await ThongBaoNtd.find({ td_ntd: $id_ntd });
    return functions.success(res, "Lay ra thong bao thanh cong", {
      data: thongBao,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.xoaThongBaoNtd = async (req, res, next) => {
  try {
    let tb_id = req.body.tb_id;
    if (tb_id && tb_id.length > 0) {
      let arrIdDelete = tb_id.map((idItem) => parseInt(idItem));
      await ThongBaoNtd.deleteMany({ tb_id: { $in: arrIdDelete } });
      return functions.success(res, "Delete Thong bao thanh cong!");
    }
    return functions.setError(res, "Missing input tb_id", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.getInfoCompany = async (req, res, next) => {
  try {
    let id_ntd = req.user.data._id;
    let ntd = await Users.findOne(
      { _id: id_ntd, type: 1 },
      {
        userName: "$userName",
        email: "$email",
        emailContact: "$emailContact",
        avatarUser: "$avatarUser",
        com_size: "$com_size",
        phone: "$phone",
        phoneTK: "$phoneTK",
        city: "$city",
        district: "$district",
        address: "$address",
        createdAt: "$createdAt",
        usc_name: "$usc_name",
        usc_name_add: "$usc_name_add",
        usc_name_phone: "$usc_name_phone",
        usc_name_email: "$usc_name_email",
        usc_mst: "$usc_mst",
        usc_website: "$usc_website",
        description: "$description",
      }
    ).lean();
    if (ntd) {
      let time_created = ntd.createdAt;
      console.log("user>>", ntd);
      if (!time_created) time_created = functions.convertTimestamp(Date.now());
      ntd.linkAvatar = functions.getLinkFile(
        folder_img,
        time_created,
        ntd.avatarUser
      );
      return functions.success(res, "lay ra thong tin thanh cong!", {
        data: ntd,
      });
    }
    return functions.setError(res, "Nha tuyen dung not found!", 404);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateInfoCompany = async (req, res, next) => {
  try {
    let id_ntd = req.user.data._id;
    console.log("req.body>>", req.body);
    let time = functions.convertTimestamp(Date.now());
    let {
      userName,
      phone,
      city,
      district,
      address,
      description,
      com_size,
      usc_name,
      usc_name_add,
      usc_name_phone,
      usc_name_email,
      usc_mst,
      usc_website,
    } = req.body;
    if (
      userName &&
      phone &&
      city &&
      district &&
      address &&
      description &&
      com_size &&
      usc_name &&
      usc_name_add &&
      usc_name_phone &&
      usc_name_email
    ) {
      let checkPhone1 = await functions.checkPhoneNumber(phone);
      let checkPhone2 = await functions.checkPhoneNumber(usc_name_phone);
      if (checkPhone1 && checkPhone2) {
        let ntd = await Users.findOneAndUpdate(
          { _id: id_ntd, type: 1 },
          {
            userName: userName,
            phone: phone,
            city: city,
            district: district,
            address: address,
            updatedAt: time,
            //cong ty
            description: description,
            com_size: com_size,
            usc_name: usc_name,
            usc_name_add: usc_name_add,
            usc_name_phone: usc_name_phone,
            usc_name_email: usc_name_email,
            usc_mst: usc_mst,
            usc_website: usc_website,
          },
          { new: true }
        );
        if (ntd) {
          return functions.success(res, "Cap nhat thong tin thanh cong!");
        }
        return functions.setError(res, "Nha tuyen dung not found!", 404);
      }
      return functions.setError(res, "Invalid phone number!", 400);
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateAvatarCompany = async (req, res, next) => {
  try {
    let id_ntd = req.user.data._id;
    let ntd = await Users.findOne({ _id: id_ntd, type: 1 });
    let time = functions.convertTimestamp(Date.now());
    if (ntd) {
      if (req.files && req.files.avatar) {
        let avatar = req.files.avatar;
        let check = await functions.checkFile(avatar.path);
        if (check) {
          let time_created = ntd.createdAt;
          if (!time_created) time_created = time;
          let nameAvatar = await functions.uploadFileNameRandom(
            folder_img,
            time_created,
            avatar
          );
          await Users.findOneAndUpdate(
            { _id: id_ntd, type: 1 },
            { avatarUser: nameAvatar, updatedAt: time },
            { new: true }
          );
          return functions.success(res, "Update avatar company success!");
        }
        return functions.setError(
          res,
          "Anh khong dung dinh dang hoac qua lon!",
          400
        );
      }
      return functions.setError(res, "Missing input avatar!", 400);
    }
    return functions.setError(res, "Nha tuyen dung khong ton tai!", 400);
  } catch (error) {
    console.log("error>>", error);
    return functions.setError(res, error.message);
  }
};
