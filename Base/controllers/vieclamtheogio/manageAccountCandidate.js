const Users = require("../../models/ViecLamTheoGio/Users");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");
const UvCvmm = require("../../models/ViecLamTheoGio/UvCvmm");
const UvKnlv = require("../../models/ViecLamTheoGio/UvKnlv");
const ViecLam = require("../../models/ViecLamTheoGio/ViecLam");
const UngTuyen = require("../../models/ViecLamTheoGio/UngTuyen");
const UvSaveVl = require("../../models/ViecLamTheoGio/UvSaveVl");
const ThongBaoNtd = require("../../models/ViecLamTheoGio/ThongBaoNtd");
const ThongBaoUv = require("../../models/ViecLamTheoGio/ThongBaoUv");
const City2 = require("../../models/ViecLamTheoGio/City2");
const functions = require("../../services/functions");
const folder_img = "user_uv";

//danh sach nganh nghe
exports.danhSachNganhNghe = async (req, res, next) => {
  try {
    let { type, jc_id, jc_parent } = req.body;
    let condition = { jc_active: 1 };

    //type=1 => lay ra tag
    if (type == 1) {
      condition.jc_parent = { $gt: 0 };
    } else {
      condition.jc_parent = 0;
    }
    if (jc_id) condition.jc_id = Number(jc_id);
    if (jc_parent) condition.jc_parent = Number(jc_parent);

    let total = await functions.findCount(JobCategory, condition);
    let data = await JobCategory.find(condition).sort({ jc_order: -1 });
    return functions.success(res, "danh sach nganh nghe", { total, data });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};
exports.listCityAndDistrict = async (req, res, next) => {
  try {
    let type = req.body.type;
    let cit_id = req.body.cit_id;
    let cit_parent = req.body.cit_parent;
    let condition = {};
    //type = 1 => quan huyen
    if (type == 1) {
      condition.cit_parent = { $gt: 0 };
    } else {
      condition.cit_parent = 0;
    }
    if (cit_id) condition.cit_id = Number(cit_id);
    if (cit_parent) condition.cit_parent = Number(cit_parent);
    let danhSachCity = await City2.find(condition, {
      cit_id: 1,
      cit_name: 1,
      cit_ndgy: 1,
    }).sort({ cit_id: 1 });
    let total = await functions.findCount(City2, condition);
    return functions.success(res, "Lay ra tag thanh cong", {
      total,
      data: danhSachCity,
    });
    return functions.success(res, "danh sach nganh nghe", { total, data });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//-----------------cong viec mong muon
exports.getCongViecMongMuon = async (req, res) => {
  try {
    const userId = req.user?.data?._id;
    if (!userId) {
      return res.status(400).json({ data: { message: "Missing user ID" } });
    }

    const uvCvmm = await UvCvmm.findOne({ id_uv_cvmm: userId });
    if (!uvCvmm) {
      return res.status(404).json({ data: { message: "Không tìm thấy thông tin công việc mong muốn" } });
    }

    // Helper: Chuyển chuỗi thành mảng số, hoặc giữ nguyên nếu đã là mảng
    const parseIds = (value) => {
      if (Array.isArray(value)) return value.map(Number).filter(Boolean);
      if (typeof value === "string")
        return value.split(",").map((v) => parseInt(v.trim())).filter(Boolean);
      return [];
    };

    const nganhNgheIds = parseIds(uvCvmm.nganh_nghe);
    const diaDiemIds = parseIds(uvCvmm.dia_diem);

    const name_job = await JobCategory.find(
      { jc_id: { $in: nganhNgheIds } },
      { _id: 0, jc_name: 1 }
    ).lean();

    const name_city = await City2.find(
      { cit_id: { $in: diaDiemIds } },
      { _id: 0, cit_name: 1 }
    ).lean();

    const responseData = {
      ...uvCvmm.toObject(),
      name_job: name_job.map((j) => j.jc_name),
      name_city: name_city.map((c) => c.cit_name),
    };

    return res.status(200).json({
      data: {
        message: "get info cong viec mong muon thanh cong",
        data: responseData,
      },
    });
  } catch (error) {
    console.error("getCongViecMongMuon error:", error);
    return res.status(500).json({
      data: {
        message: "Lỗi server khi lấy thông tin công việc mong muốn",
      },
    });
  }
};


exports.updateCongViecMongMuon = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let { cong_viec, nganh_nghe, dia_diem, cap_bac, hinh_thuc, luong } =
      req.body;
    console.log("aa", req.body);
    if (
      cong_viec &&
      nganh_nghe &&
      dia_diem &&
      dia_diem.length > 0 &&
      nganh_nghe.length > 0
    ) {
      let time = functions.convertTimestamp(Date.now());
      let user = await Users.findOneAndUpdate(
        { _id: userId, type: 0 },
        { updatedAt: time },
        { new: true }
      );
      if (user) {
        nganh_nghe = nganh_nghe.join(", ");
        dia_diem = dia_diem.join(", ");
        let uvCvmm = await UvCvmm.findOneAndUpdate(
          { id_uv_cvmm: userId },
          {
            cong_viec: cong_viec,
            nganh_nghe: nganh_nghe,
            dia_diem: dia_diem,
            lever: cap_bac,
            hinh_thuc: hinh_thuc,
            luong: luong,
          },
          { new: true, upsert: true }
        );
        if (uvCvmm) {
          return functions.success(res, "Update cvmm success!", { uvCvmm });
        }
        return functions.setError(res, "Update cvmm fail!", 406);
      }
      return functions.setError(res, "user not found!", 404);
    }
    return functions.setError(res, "Missing input value!", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateKyNangBanThan = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let ky_nang = req.body.ky_nang;
    let time = functions.convertTimestamp(Date.now());
    let user = await Users.findOneAndUpdate(
      { _id: userId, type: 0 },
      { updatedAt: time },
      { new: true }
    );
    if (user) {
      let uvCvmm = await UvCvmm.findOneAndUpdate(
        { id_uv_cvmm: userId },
        {
          ky_nang: ky_nang,
        },
        { new: true, upsert: true }
      );
      if (uvCvmm) {
        return functions.success(res, "Update cvmm success!", { uvCvmm });
      }
      return functions.setError(res, "Update cvmm fail!", 406);
    }
    return functions.setError(res, "user not found!", 404);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//-------------kinh nghiem lam viec
exports.getKinhNghiemLamViec = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let uvKnlv = await UvKnlv.find({ id_uv_knlv: userId }).sort({ id_knlv: 1 });
    return functions.success(res, "get info kinh nghiem lam viec thanh cong", {
      data: uvKnlv,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.createKinhNghiemLamViec = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let { chuc_danh, time_fist, time_end, cty_name, mota } = req.body;
    let now = Date.now();
    if (chuc_danh && time_fist && time_end && cty_name && mota) {
      if (functions.checkDate(time_fist) && functions.checkDate(time_end)) {
        time_fist = new Date(time_fist);
        time_end = new Date(time_end);
        if (time_fist <= now && time_end <= now && time_end >= time_fist) {
          let idMax = await functions.getMaxIdByField(UvKnlv, "id_knlv");
          let knlv = new UvKnlv({
            id_knlv: idMax,
            id_uv_knlv: userId,
            chuc_danh: chuc_danh,
            time_fist: time_fist,
            time_end: time_end,
            cty_name: cty_name,
            mota: mota,
          });
          knlv = await knlv.save();
          if (knlv) {
            return functions.success(
              res,
              "create kinh nghiem lam viec success!",
              { data: knlv._doc }
            );
          }
          return functions.setError(
            res,
            "create kinh nghiem lam viec fail",
            408
          );
        }
        return functions.setError(
          res,
          "time_end > now or time_fist > now or time_end<time_fist",
          410
        );
      }
      return functions.setError(res, "invalid date", 406);
    }
    return functions.setError(res, "Missing input value", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateKinhNghiemLamViec = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let { id_knlv, chuc_danh, time_fist, time_end, cty_name, mota } = req.body;
    let now = Date.now();
    let time = functions.convertTimestamp(now);
    if (id_knlv && chuc_danh && time_fist && time_end && cty_name && mota) {
      if (functions.checkDate(time_fist) && functions.checkDate(time_end)) {
        time_fist = new Date(time_fist);
        time_end = new Date(time_end);
        if (time_fist < now && time_end < now && time_end > time_fist) {
          let user = await Users.findOneAndUpdate(
            { _id: userId, type: 0 },
            { updatedAt: time },
            { new: true }
          );
          if (!user) return functions.setError(res, "user not found!", 404);
          let knlv = await UvKnlv.findOneAndUpdate(
            { id_knlv: Number(id_knlv), id_uv_knlv: userId },
            {
              chuc_danh: chuc_danh,
              time_fist: time_fist,
              time_end: time_end,
              cty_name: cty_name,
              mota: mota,
            },
            { new: true }
          );
          if (knlv) {
            return functions.success(
              res,
              "update kinh nghiem lam viec success!"
            );
          }
          return functions.setError(
            res,
            "kinh nghiem lam viec not found!",
            408
          );
        }
        return functions.setError(
          res,
          "time_end > now or time_fist > now or time_end<time_fist",
          407
        );
      }
      return functions.setError(res, "invalid date", 406);
    }
    return functions.setError(res, "Missing input value", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.deleteKinhNghiemLamViec = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let id_knlv = req.body.id_knlv;
    if (id_knlv) {
      let uvKnlv = await UvKnlv.findOneAndDelete({
        id_knlv: Number(id_knlv),
        id_uv_knlv: userId,
      });
      if (uvKnlv) {
        return functions.success(res, "xoa kinh nghiem lam viec thanh cong");
      }
      return functions.setError(res, "Kinh nghiem lam viec not found", 404);
    }
    return functions.setError(res, "Missing input id_knlv", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//---------------Buoi co the di lam
exports.getBuoiCoTheDiLam = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let user_uv = await Users.findOne(
      { _id: userId, type: 0 },
      {
        userName: "$userName",
        phone: "$phone",
        phoneTK: "$phoneTK",
        email: "$email",
        city: "$city",
        district: "$district",
        address: "$address",
        gender: "$gender",
        married: "$married",
        birthday: "$birthday",
        uv_day: "$uv_day",
        luot_xem: "$luot_xem",
      }
    );
    if (user_uv) {
      return functions.success(res, "get info ung vien thanh cong", {
        data: user_uv,
      });
    }
    return functions.setError(res, "ung vien not fund!", 404);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateBuoiCoTheDiLam = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let day = req.body.day;
    if (day && day.length > 0) {
      day = day.join(", ");
      let time = functions.convertTimestamp(Date.now());
      let user_uv = await Users.findOneAndUpdate(
        { _id: userId, type: 0 },
        {
          updatedAt: time,
          uv_day: day,
        },
        { new: true }
      );
      if (user_uv) {
        return functions.success(res, "update ung vien thanh cong");
      }
      return functions.setError(res, "ung vien not fund!", 404);
    }
    return functions.setError(res, "Missing input day!", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//----viec lam da ung tuyen
exports.getViecLamDaUngTuyen = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let { page, pageSize } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 6;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;

    let listViecLam = await ViecLam.aggregate([
      {
        $lookup: {
          from: "VLTG_UngTuyen",
          localField: "id_vieclam",
          foreignField: "id_viec",
          as: "UngTuyen",
        },
      },
      { $match: { "UngTuyen.id_uv": userId } },
      { $sort: { "UngTuyen.id_ungtuyen": -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $project: {
          id_vieclam: "$id_vieclam",
          alias: "$alias",
          vi_tri: "$vi_tri",
          muc_luong: "$muc_luong",
          tra_luong: "$tra_luong",
          fist_time: "$fist_time",
          last_time: "$last_time",
          UngTuyen: "$UngTuyen",
        },
      },
    ]);

    let total = await UngTuyen.distinct("id_viec", { id_uv: userId });
    total = total.length;
    return functions.success(
      res,
      "get danh sach viec lam da ung tuyen thanh cong",
      { total: total, data: listViecLam }
    );
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.deleteViecLamDaUngTuyen = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let id_viec = req.body.id_viec;
    if (id_viec) {
      let ungTuyen = await UngTuyen.deleteMany({
        id_uv: userId,
        id_viec: Number(id_viec),
      });
      if (ungTuyen && ungTuyen.deletedCount > 0) {
        return functions.success(
          res,
          "Delete viec lam da ung tuyen thanh cong!"
        );
      }
      return functions.setError(res, "Viec lam da ung tuyen not found", 405);
    }
    return functions.setError(res, "Missing input id_viec", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//-------------Viec lam da luu
exports.getViecLamDaLuu = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let { page, pageSize } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 6;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;

    let listViecLam = await UvSaveVl.aggregate([
      { $match: { id_uv: userId } },
      { $sort: { id: -1 } },
      { $skip: skip },
      { $limit: pageSize },
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
        $project: {
          id: "$id",
          id_uv: "$id_uv",
          id_viec: "$id_viec",
          ntd_name: "$ntd_name",
          created_at: "$created_at",
          alias: "$ViecLam.alias",
          vi_tri: "$ViecLam.vi_tri",
          muc_luong: "$ViecLam.muc_luong",
          tra_luong: "$ViecLam.tra_luong",
          fist_time: "$ViecLam.fist_time",
          last_time: "$ViecLam.last_time",
        },
      },
    ]);

    let total = await functions.findCount(UvSaveVl, { id_uv: userId });
    return functions.success(
      res,
      "get danh sach viec lam da ung tuyen thanh cong",
      { total: total, data: listViecLam }
    );
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.deleteViecLamDaLuu = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let id_viec = req.body.id_viec;
    if (id_viec) {
      let viecLamDaLuu = await UvSaveVl.findOneAndDelete({
        id_uv: userId,
        id_viec: Number(id_viec),
      });
      if (viecLamDaLuu) {
        return functions.success(res, "Delete viec lam da luu thanh cong!");
      }
      return functions.setError(res, "Viec lam da luu not found", 405);
    }
    return functions.setError(res, "Missing input id_viec", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//--------------cac chuc nang lien quan
exports.nhanViec = async (req, res, next) => {
  try {
    console.log("da ta vao", req.body)
    let userId = req.user.data._id;
    let { id_viec, list_ca } = req.body;
    if (id_viec && list_ca && list_ca.length > 0) {
      id_viec = Number(id_viec);
      let viecLam = await ViecLam.findOne({ id_vieclam: id_viec });
      if (viecLam) {
        let ntd = await Users.findOne({
          _id: viecLam.id_ntd,
          type: 1,
        });
        let ungVien = await Users.findOne({ _id: userId, type: 0 });
        if (ntd && ungVien) {
          let check = await UngTuyen.findOne({
            id_uv: userId,
            id_viec: id_viec,
          });
          if (!check) {
            for (let i = 0; i < list_ca.length; i++) {
              let day = list_ca[i].day;
              day = day.join(" ");
              let ca_lam = list_ca[i].ca_lam;
              let gio_lam = list_ca[i].gio_lam;

              let idMax = await functions.getMaxIdByField(
                UngTuyen,
                "id_ungtuyen"
              );
              let nhanViec = new UngTuyen({
                id_ungtuyen: idMax,
                id_uv: userId,
                id_ntd: viecLam.id_ntd,
                id_viec: id_viec,
                ca_lam: ca_lam,
                gio_lam: gio_lam,
                day: day,
                ghi_chu: "",
                status: 1,
                created_at: Date.now(),
              });
              nhanViec = await nhanViec.save();
            }
            //them thong tin vao model thong bao
            let maxIdTb = await functions.getMaxIdByField(ThongBaoNtd, "tb_id");
            let uv_name = ungVien.userName ? ungVien.userName : "";
            let uv_avatar = ungVien.avatarUser ? ungVien.avatarUser : "";
            let thongBaoNtd = new ThongBaoNtd({
              tb_id: maxIdTb,
              td_uv: userId,
              td_ntd: ntd._id,
              tb_name: uv_name,
              tb_avatar: uv_avatar,
            });
            await Promise.all([
              thongBaoNtd.save(),
              functions.sendEmailNtd(ntd, ungVien, viecLam),
              functions.sendEmailApplySuccessToUv(ntd, ungVien, viecLam),
            ]);
            // await thongBaoNtd.save();
            //gui mail
            // await functions.sendEmailNtd(ntd, ungVien, viecLam);
            // await functions.sendEmailApplySuccessToUv(ntd, ungVien, viecLam);
            return functions.success(res, "Ung tuyen viec lam thanh cong!");
          }
          return functions.setError(
            res,
            "Ung tuyen da ung tuyen viec lam",
            400
          );
        }
        return functions.setError(
          res,
          "Nha tuyen dung or Ung vien khong ton tai!",
          406
        );
      }
      return functions.setError(res, "Viec lam not found!", 406);
    }
    return functions.setError(res, "Missing input value", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.luuViecLam = async (req, res, next) => {
  try {
    let userId = req.user.data._id;
    let id_viec = req.body.id_viec;
    if (id_viec) {
      id_viec = Number(id_viec);
      let viecLam = await ViecLam.findOne({ id_vieclam: id_viec });
      if (viecLam) {
        let ntd = await Users.findOne(
          { _id: viecLam.id_ntd, type: 1 },
          { userName: 1 }
        );
        if (ntd) {
          let check = await UvSaveVl.findOne({
            id_uv: userId,
            id_viec: id_viec,
          });
          if (check) {
            await UvSaveVl.findOneAndDelete({
              id_uv: userId,
              id_viec: id_viec,
            });
            return functions.success(res, "Huy luu viec lam thanh cong!");
          }
          let idMax = await functions.getMaxIdByField(UvSaveVl, "id");
          let luuViecLam = new UvSaveVl({
            id: idMax,
            id_uv: userId,
            id_viec: id_viec,
            ntd_name: ntd.userName,
            created_at: Date.now(),
          });
          luuViecLam = luuViecLam.save();
          if (luuViecLam) {
            return functions.success(res, "Luu viec lam thanh cong!");
          }
          return functions.setError(res, "Luu viec lam fail", 408);
        }
        return functions.setError(res, "Nha tuyen dung not found!", 407);
      }
      return functions.setError(res, "Viec lam not found!", 406);
    }
    return functions.setError(res, "Missing input value", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.lamMoiUngVien = async (req, res, next) => {
  try {
    let id_uv = req.body.id_uv;
    if (id_uv) {
      id_uv = Number(id_uv);
      let time = functions.convertTimestamp(Date.now());
      let ungVien = await Users.findOneAndUpdate(
        { _id: id_uv, type: 0 },
        { updatedAt: time },
        { new: true }
      );
      if (ungVien) {
        return functions.success(res, "Lam moi ung vien thanh cong!");
      }
      return functions.setError(res, "Lam moi ung vien that bai", 405);
    }
    return functions.setError(res, "Missing input id_uv", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.getThongBaoUv = async (req, res, next) => {
  try {
    let id_uv = req.user.data._id;
    let thongBao = await ThongBaoUv.find({ td_uv: id_uv });
    return functions.success(res, "Lay ra thong bao thanh cong", {
      data: thongBao,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.xoaThongBaoUv = async (req, res, next) => {
  try {
    let tb_id = req.body.tb_id;
    if (tb_id && tb_id.length > 0) {
      let arrIdDelete = tb_id.map((idItem) => parseInt(idItem));
      await ThongBaoUv.deleteMany({ tb_id: { $in: arrIdDelete } });
      return functions.success(res, "Delete Thong bao thanh cong!");
    }
    return functions.setError(res, "Missing input tb_id", 405);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.getInfoCandidate = async (req, res, next) => {
  try {
    let id_uv = req.user.data._id;
    let uv = await Users.findOne(
      { _id: id_uv, type: 0 },
      {
        userName: "$userName",
        email: "$email",
        emailContact: "$emailContact",
        avatarUser: "$avatarUser",
        phone: "$phone",
        phoneTK: "$phoneTK",
        city: "$city",
        district: "$district",
        address: "$address",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        birthday: "$birthday",
        gender: "$gender",
        married: "$married",
        uv_day: "$uv_day",
        luot_xem: "$luot_xem",
        uv_search: "$uv_search",
        uv_source: "$uv_source",
      }
    ).lean();
    if (uv) {
      let time_created = uv.createdAt;
      if (!time_created) time_created = functions.convertTimestamp(Date.now());
      uv.linkAvatar = functions.getLinkFile(
        folder_img,
        time_created,
        uv.avatarUser
      );

      //thong tin cong viec mong muon
      let uvCvmm = await UvCvmm.findOne({ id_uv_cvmm: id_uv }).lean();
      if (uvCvmm) {
        let job = await JobCategory.find({}, { jc_id: 1, jc_name: 1 });
        let city = await City2.find(
          { cit_parent: 0 },
          { cit_id: 1, cit_name: 1 }
        );
        let nganh_nghe = uvCvmm.nganh_nghe;
        let dia_diem = uvCvmm.dia_diem;

        let name_job = [];
        let name_city = [];
        if (nganh_nghe) {
          nganh_nghe = nganh_nghe.split(", ");
          for (let i = 0; i < nganh_nghe.length; i++) {
            let nn = job.filter((e) => e.jc_id == nganh_nghe[i]);
            if (nn && nn.length > 0) {
              name_job.push(nn[0]);
            }
          }
        }
        uvCvmm.name_job = name_job;
        if (dia_diem) {
          dia_diem = dia_diem.split(", ");
          for (let i = 0; i < dia_diem.length; i++) {
            let dd = city.filter((e) => e.cit_id == dia_diem[i]);
            if (dd && dd.length > 0) {
              name_city.push(dd[0]);
            }
          }
        }
        uvCvmm.name_job = name_job;
        uvCvmm.name_city = name_city;
      }
      return functions.success(res, "lay ra thong tin thanh cong!", {
        data: uv,
        uvCvmm: uvCvmm,
      });
    }
    return functions.setError(res, "Ung vien not found!", 404);
  } catch (error) {
    console.log("error:::", error);
    return functions.setError(res, error.message);
  }
};

exports.updateInfoCandidate = async (req, res, next) => {
  try {
    let id_uv = req.user.data._id;
    let {
      userName,
      phone,
      city,
      email,
      district,
      address,
      birthday,
      gender,
      married,
    } = req.body;
    if (
      id_uv &&
      userName &&
      phone &&
      city &&
      email &&
      district &&
      address &&
      birthday
    ) {
      if (!gender) gender = 0;
      if (!married) married = 0;
      let checkPhone = functions.checkPhoneNumber(phone);
      let checkDate = functions.checkDate(birthday);
      if (checkPhone) {
        birthday = functions.convertTimestamp(birthday);
        let time = functions.convertTimestamp(Date.now());
        let ungVien = await Users.findOneAndUpdate(
          { _id: id_uv, type: 0 },
          {
            userName: userName,
            phone: phone,
            email: email,
            city: city,
            district: district,
            address: address,
            updatedAt: time,
            birthday: birthday,
            gender: gender,
            married: married,
          },
          { new: true }
        );
        if (ungVien) {
          return functions.success(res, "Cap nhat thong tin thanh cong!");
        }
        return functions.setError(res, "Nha tuyen dung not found!", 404);
      }
      return functions.setError(
        res,
        "Invalid phone number or invalid date!",
        400
      );
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateAvatarCandidate = async (req, res, next) => {
  try {
    let id_uv = req.user.data._id;
    let ungVien = await Users.findOne({ _id: id_uv, type: 0 });
    let time = functions.convertTimestamp(Date.now());
    console.log("files", req.files);
    if (ungVien) {
      if (req.files && req.files.avatar) {
        let avatar = req.files.avatar;
        let check = await functions.checkFile(avatar.path);
        if (check) {
          let time_created = ungVien.createdAt;
          if (!time_created) time_created = time;
          let nameAvatar = await functions.uploadFileNameRandom(
            folder_img,
            time_created,
            avatar
          );
          await Users.findOneAndUpdate(
            { _id: id_uv, type: 0 },
            { avatarUser: nameAvatar, updatedAt: time },
            { new: true }
          );
          return functions.success(res, "Update avatar ung vien success!");
        }
        return functions.setError(
          res,
          "Anh khong dung dinh dang hoac qua lon!",
          400
        );
      }
      return functions.setError(res, "Missing input avatar!", 400);
    }
    return functions.setError(res, "Ung vien khong ton tai!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateStatusSearch = async (req, res, next) => {
  try {
    let id_uv = req.body.id_uv;
    let status = req.body.status;
    if (!id_uv) id_uv = req.user.data._id;
    id_uv = Number(id_uv);
    let ungVien = await Users.findOne(
      { _id: id_uv, type: 0 },
      { _id: 1, uv_search: 1 }
    );
    let time = functions.convertTimestamp(Date.now());
    if (ungVien) {
      if (!status) status = 0;
      await Users.findOneAndUpdate(
        { _id: id_uv, type: 0 },
        { updatedAt: time, uv_search: status }
      );
      return functions.success(res, "update status search candidate success!");
    }
    return functions.setError(res, "Nha tuyen dung khong ton tai!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateInfo = async (req, res, next) => {
  try {
    let id_uv = req.user.data._id;
    let {
      email,
      gender,
      birthday,
      city,
      district,
      cong_viec,
      dia_diem,
      nganh_nghe,
      day,
    } = req.body;
    if (
      email &&
      city &&
      district &&
      cong_viec &&
      dia_diem &&
      nganh_nghe &&
      day
    ) {
      if (!gender) gender = 0;
      let checkEmail = functions.checkEmail(email);
      let checkDate = functions.checkDate(birthday);
      if (checkEmail && checkDate) {
        let checkEmailExist = await Users.findOne({
          email: email,
          _id: { $ne: id_uv },
        });
        if (!checkEmailExist) {
          birthday = functions.convertTimestamp(birthday);
          let time = functions.convertTimestamp(Date.now());

          day = day.join(", ");
          let ungVien = await Users.findOne({ _id: id_uv, type: 0 });
          ungVien = await Users.findOneAndUpdate(
            { _id: id_uv, type: 0 },
            {
              email: email,
              city: city,
              district: district,
              updatedAt: time,
              gender: gender,
              birthday: birthday,
              day: day,
            },
            { new: true }
          );
          if (ungVien) {
            nganh_nghe = nganh_nghe.join(", ");
            dia_diem = dia_diem.join(", ");
            let uvCvmm = await UvCvmm.findOneAndUpdate(
              { id_uv_cvmm: id_uv },
              {
                cong_viec: cong_viec,
                nganh_nghe: nganh_nghe,
                dia_diem: dia_diem,
              },
              { new: true, upsert: true }
            );
            if (uvCvmm) {
              return functions.success(res, "Cap nhat thong tin thanh cong!");
            }
            return functions.setError(res, "cvmm not found!", 404);
          }
          return functions.setError(res, "Ung vien not found!", 404);
        }
        return functions.setError(res, "Email da ton tai", 404);
      }
      return functions.setError(
        res,
        "Invalid phone number or invalid date!",
        400
      );
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};
