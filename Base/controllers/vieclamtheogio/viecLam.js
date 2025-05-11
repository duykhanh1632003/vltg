const Users = require("../../models/ViecLamTheoGio/Users");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");
const UvCvmm = require("../../models/ViecLamTheoGio/UvCvmm");
const UvKnlv = require("../../models/ViecLamTheoGio/UvKnlv");
const ViecLam = require("../../models/ViecLamTheoGio/ViecLam");
const UngTuyen = require("../../models/ViecLamTheoGio/UngTuyen");
const UvSaveVl = require("../../models/ViecLamTheoGio/UvSaveVl");
const City2 = require("../../models/ViecLamTheoGio/City2");
const functions = require("../../services/functions");
const folder_img = "user_ntd";

//danh sach nganh nghe
exports.danhSachViecLam = async (req, res, next) => {
  try {
    // console.log("req.body", req.body);
    let { page, pageSize, key, city, district, id_vieclam, tag } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 24;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let time = functions.convertTimestamp(Date.now());
    time = time - 86400;
    let listTag = [];
    let condition = { time_td: { $gt: time }, active: 1 };
    if (key) {
      let arr_key = key.split(" ");
      let orCondition = [];
      for (let i = 0; i < arr_key.length; i++) {
        orCondition.push({ vi_tri: new RegExp(arr_key[i], "i") });
      }
      condition = { time_td: { $gt: time }, $or: orCondition, active: 1 };
    }
    if (city) {
      condition.dia_diem = new RegExp(`\\b${city}\\b`);
      let blog = await City2.findOne({ cit_id: Number(city), cit_parent: 0 });
      if (blog) listTag.push(blog);
    }
    if (district) {
      condition.quan_huyen = new RegExp(`\\b${district}\\b`);
      let blog = await City2.findOne({
        cit_id: Number(district),
        cit_parent: { $gt: 0 },
      });
      if (blog) listTag.push(blog);
    }
    if (tag) {
      condition.nganh_nghe = new RegExp(`\\b${tag}\\b`);
      let blog = await JobCategory.findOne({ jc_id: Number(tag) });
      if (blog) listTag.push(blog);
    }
    //
    let nhanViec = false;
    let luuViec = false;
    let viecLamKhac = [];
    let tenNganhNghe = [];
    let viecLamTuongTu = [];
    //xem chi tiet viec lam
    if (id_vieclam) {
      id_vieclam = Number(id_vieclam);
      condition = { id_vieclam: id_vieclam };
      let viecLam = await ViecLam.findOne({ id_vieclam: id_vieclam });
      let id_uv = req.user && req.user.data ? req.user.data._id : 0;
      if (viecLam) {
        //cap nhat luot xem
        let luot_xem = viecLam.luot_xem + 1;
        await ViecLam.findOneAndUpdate(
          { id_vieclam: id_vieclam },
          { luot_xem: luot_xem },
          { new: true }
        );
        //viec lam cung nha tuyen dung
        viecLamKhac = await ViecLam.aggregate([
          {
            $match: {
              id_ntd: viecLam.id_ntd,
              id_vieclam: { $ne: id_vieclam },
              active: 1,
            },
          },
          { $sort: { id_vieclam: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "Users",
              localField: "id_ntd",
              foreignField: "_id",
              pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 1 } }],
              as: "NTD",
            },
          },
          { $unwind: { path: "$NTD", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              id_vieclam: "$id_vieclam",
              vi_tri: "$vi_tri",
              alias: "$alias",
              dia_diem: "$dia_diem",
              quan_huyen: "$quan_huyen",
              hinh_thuc: "$hinh_thuc",
              muc_luong: "$muc_luong",
              tra_luong: "$tra_luong",
              nganh_nghe: "$nganh_nghe",
              id_ntd: "$id_ntd",
              ntd_avatar: "$NTD.avatarUser",
              ntd_address: "$NTD.address",
              ntd_userName: "$NTD.userName",
              ntd_createdAt: "$NTD.createdAt",
              address: "address",
              luong: "$luong",
              luong_first: "$luong_first",
              luong_last: "$luong_last",
              ht_luong: "$ht_luong",
              time_td: "$time_td",
            },
          },
        ]);
        for (let i = 0; i < viecLamKhac.length; i++) {
          let time_created = viecLamKhac[i].ntd_createdAt;
          if (!time_created)
            time_created = functions.convertTimestamp(Date.now());
          let linkAvatar = functions.getLinkFile(
            folder_img,
            time_created,
            viecLamKhac[i].ntd_avatar
          );
          linkAvatar="https://weone.vn/wp-content/uploads/2022/01/cach-xay-dung-hinh-anh-doanh-nghiep-3.png"
          viecLamKhac[i].linkAvatar = linkAvatar;
        }

        // console.log("viecLamKhac", viecLamKhac);
        //ten nganh nghe
        let arr_nganh = viecLam.nganh_nghe;
        arr_nganh = arr_nganh.split(", ");
        for (let i = 0; i < arr_nganh.length; i++) {
          let id_nganh = Number(arr_nganh[i]);
          if (id_nganh) {
            let tenNganh = await JobCategory.findOne(
              { jc_id: id_nganh },
              { jc_id: 1, jc_name: 1 }
            ).lean();
            if (tenNganh) {
              tenNganhNghe.push(tenNganh);
            }
          }
        }
        //viec lam tuong tu
        let orCondition = [];
        for (let i = 0; i < arr_nganh.length; i++) {
          // RegExp(`\\b${district}\\b`
          orCondition.push({ nganh_nghe: new RegExp(`\\b${arr_nganh[i]}\\b`) });
        }
        // time_td: {$gt: time}
        let condition2 = {
          id_vieclam: { $ne: id_vieclam },
          $or: orCondition,
          active: 1,
        };
        viecLamTuongTu = await ViecLam.aggregate([
          { $match: condition2 },
          { $sort: { time_td: -1 } },
          { $limit: 4 },
          {
            $lookup: {
              from: "Users",
              localField: "id_ntd",
              foreignField: "_id",
              pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 1 } }],
              as: "NTD",
            },
          },
          { $unwind: { path: "$NTD", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              id_vieclam: "$id_vieclam",
              vi_tri: "$vi_tri",
              alias: "$alias",
              dia_diem: "$dia_diem",
              quan_huyen: "$quan_huyen",
              hinh_thuc: "$hinh_thuc",
              muc_luong: "$muc_luong",
              tra_luong: "$tra_luong",
              nganh_nghe: "$nganh_nghe",
              id_ntd: "$id_ntd",
              ntd_avatar: "$NTD.avatarUser",
              ntd_address: "$NTD.address",
              ntd_userName: "$NTD.userName",
              ntd_createdAt: "$NTD.createdAt",
              luong: "$luong",
              luong_first: "$luong_first",
              luong_last: "$luong_last",
              ht_luong: "$ht_luong",
              time_td: "$time_td",
            },
          },
        ]);
        for (let i = 0; i < viecLamTuongTu.length; i++) {
          let time_created = viecLamTuongTu[i].ntd_createdAt;
          if (!time_created)
            time_created = functions.convertTimestamp(Date.now());
          let linkAvatar = functions.getLinkFile(
            folder_img,
            time_created,
            viecLamTuongTu[i].ntd_avatar
          );
          viecLamTuongTu[i].linkAvatar = linkAvatar;
        }
        if (id_uv) {
          let ungTuyen = await UngTuyen.distinct("id_viec", {
            id_uv: id_uv,
            id_viec: id_vieclam,
          });
          if (ungTuyen.length > 0) nhanViec = true;
          let uvLuuViec = await UvSaveVl.findOne({
            id_uv: id_uv,
            id_viec: id_vieclam,
          });
          if (uvLuuViec) luuViec = true;
        }
      } else {
        return functions.setError(res, "Viec lam not found!", 404);
      }
    }
    let danhSachViecLam = await ViecLam.aggregate([
      { $match: condition },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "Users",
          localField: "id_ntd",
          foreignField: "_id",
          pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 1 } }],
          as: "NTD",
        },
      },
      { $unwind: { path: "$NTD", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "VLTG_CaLamViec",
          localField: "id_vieclam",
          foreignField: "ca_id_viec",
          as: "CaLamViec",
        },
      },
      {
        $project: {
          id_vieclam: "$id_vieclam",
          vi_tri: "$vi_tri",
          alias: "$alias",
          dia_diem: "$dia_diem",
          quan_huyen: "$quan_huyen",
          hinh_thuc: "$hinh_thuc",
          muc_luong: "$muc_luong",
          luong: "$luong",
          luong_first: "$luong_first",
          luong_last: "$luong_last",
          ht_luong: "$ht_luong",
          tra_luong: "$tra_luong",
          id_ntd: "$id_ntd",
          hoc_van: "$hoc_van",
          thoi_gian: "$thoi_gian",
          hoa_hong: "$hoa_hong",
          so_luong: "$so_luong",
          nganh_nghe: "$nganh_nghe",
          cap_bac: "$cap_bac",
          time_td: "$time_td",
          fist_time: "$fist_time",
          last_time: "$last_time",
          mo_ta: "$mo_ta",
          gender: "$gender",
          yeu_cau: "$yeu_cau",
          quyen_loi: "$quyen_loi",
          ho_so: "$ho_so",
          luot_xem: "$luot_xem",
          name_lh: "$name_lh",
          phone_lh: "$phone_lh",
          address_lh: "$address_lh",
          email_lh: "$email_lh",
          vl_created_time: "$vl_created_time",
          active: "$active",
          created_at: "$created_at",
          vl_index: "$vl_index",
          ntd_avatar: "$NTD.avatarUser",
          ntd_address: "$NTD.address",
          ntd_userName: "$NTD.userName",
          ntd_quymo: "$NTD.com_size",
          ntd_createdAt: "$NTD.createdAt",
          CaLamViec: "$CaLamViec",
          address: "$address",
        },
      },
    ]);
    for (let i = 0; i < danhSachViecLam.length; i++) {
      let linkAvatar = functions.getLinkFile(
        "user_ntd",
        danhSachViecLam[i].ntd_createdAt,
        danhSachViecLam[i].ntd_avatar
      );
      danhSachViecLam[i].linkAvatar = linkAvatar;
      danhSachViecLam[i].nhanViec = nhanViec;
      danhSachViecLam[i].luuViec = luuViec;
      danhSachViecLam[i].viecLamKhac = viecLamKhac;
      danhSachViecLam[i].viecLamTuongTu = viecLamTuongTu;
      danhSachViecLam[i].tenNganhNghe = tenNganhNghe;
      if (danhSachViecLam[i].ht_luong == 2) {
        let a = danhSachViecLam[i].muc_luong.split(" - ");
        danhSachViecLam[i].luong_first = a[0];
        danhSachViecLam[i].luong_end = a[1];
      }
    }
    let total = await functions.findCount(ViecLam, condition);
    return functions.success(res, "danh sach viec lam", {
      total,
      data: danhSachViecLam,
      listTag,
    });
  } catch (error) {
    console.log("err::", error);
    return functions.setError(res, error.message);
  }
};

exports.tuKhoaLienQuan = async (req, res, next) => {
  try {
    let tuKhoaLienQuan = await JobCategory.find(
      { jc_parent: { $gt: 0 } },
      { jc_id: 1, jc_name: 1 }
    )
      .sort({ jc_id: 1 })
      .lean();
    return functions.success(
      res,
      "Lay ra danh sach cong viec lien quan thanh cong",
      { data: tuKhoaLienQuan }
    );
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.trangChu = async (req, res, next) => {
  try {
    let { page, pageSize } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 24;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    let now = new Date(Date.now());
    let time = functions.convertTimestamp(Date.now());
    time = time - 86400;
    // let condition = { time_td: { $gt: time }, active: 1 };
    // let user = req.user && req.user.data ? req.user.data : null;
    let id_uv = req.user && req.user.data ? req.user.data._id : 0;

    let condition = { active: 1 };
    let condition2 = {
      $or: [
        { tra_luong: 1, luong: { $gte: 30000 } },
        { tra_luong: 2, luong: { $gte: 300000 } },
        { tra_luong: 3, luong: { $gte: 4000000 } },
        { tra_luong: 1, luong_first: { $gte: 30000 } },
        { tra_luong: 2, luong_first: { $gte: 300000 } },
        { tra_luong: 3, luong_first: { $gte: 4000000 } },
      ],
      active: 1,
    };
    if (id_uv) {
      let user = await Users.findOne({ _id: id_uv });
      // condition = { active: 1, nganh_nghe: new RegExp(`\\b${user.nganh_nghe}\\b`) };
      condition["dia_diem"] = user.city;
      condition2["dia_diem"] = user.city;
    }
    let viecLamMoiNhat = await ViecLam.aggregate([
      { $match: condition },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "Users",
          localField: "id_ntd",
          foreignField: "_id",
          pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 1 } }],
          as: "NTD",
        },
      },
      { $unwind: { path: "$NTD", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id_vieclam: "$id_vieclam",
          vi_tri: "$vi_tri",
          alias: "$alias",
          dia_diem: "$dia_diem",
          quan_huyen: "$quan_huyen",
          hinh_thuc: "$hinh_thuc",
          muc_luong: "$muc_luong",
          ht_luong: "$ht_luong",
          luong: "$luong",
          luong_first: "$luong_first",
          luong_last: "$luong_last",
          time_td: "$time_td",
          tra_luong: "$tra_luong",
          nganh_nghe: "$nganh_nghe",
          id_ntd: "$id_ntd",
          ntd_avatar: "$NTD.avatarUser",
          first_time:"$first_time",
          last_time:"$last_time",
          ntd_address: "$NTD.address",
          ntd_userName: "$NTD.userName",
          ntd_createdAt: "$NTD.createdAt",
          address: "$address",
        },
      },
    ]);
    let total1 = await functions.findCount(ViecLam, condition);
    //viec lam luong hap dan
    // muc_luong: {$gte: "3"}
    let viecLamHapDan = await ViecLam.aggregate([
      { $match: condition2 },
      { $sort: { tra_luong: 1, muc_luong: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "Users",
          localField: "id_ntd",
          foreignField: "_id",
          pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 1 } }],
          as: "NTD",
        },
      },
      { $unwind: { path: "$NTD", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id_vieclam: "$id_vieclam",
          vi_tri: "$vi_tri",
          alias: "$alias",
          dia_diem: "$dia_diem",
          quan_huyen: "$quan_huyen",
          hinh_thuc: "$hinh_thuc",
          muc_luong: "$muc_luong",
          ht_luong: "$ht_luong",
          luong: "$luong",
          luong_first: "$luong_first",
          luong_last: "$luong_last",
          time_td: "$time_td",
          tra_luong: "$tra_luong",
          nganh_nghe: "$nganh_nghe",
          id_ntd: "$id_ntd",
          ntd_avatar: "$NTD.avatarUser",
          ntd_address: "$NTD.address",
          ntd_userName: "$NTD.userName",
          ntd_createdAt: "$NTD.createdAt",
          address: "$address",
        },
      },
    ]);
    let total2 = await functions.findCount(ViecLam, condition2);
    for (let i = 0; i < viecLamMoiNhat.length; i++) {
      viecLamMoiNhat[i].linkAvatar = functions.getLinkFile(
        "user_ntd",
        viecLamMoiNhat[i].ntd_createdAt,
        viecLamMoiNhat[i].ntd_avatar
      );
    }
    for (let i = 0; i < viecLamHapDan.length; i++) {
      // viecLamHapDan[i].linkAvatar = functions.getUrlLogoCompany(
      //   viecLamHapDan[i].ntd_createdAt,
      //   viecLamHapDan[i].ntd_avatar
      // );
      viecLamHapDan[i].linkAvatar = functions.getLinkFile(
        "user_ntd",
        viecLamHapDan[i].ntd_createdAt,
        viecLamHapDan[i].ntd_avatar
      );
    }
    return functions.success(res, "Lay ra danh sach trang chu thanh cong", {
      total1,
      total2,
      viecLamMoiNhat,
      viecLamHapDan,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.thongKeViecLam = async (req, res, next) => {
  try {
    let time = functions.convertTimestamp(Date.now());
    time = time - 86400;
    let now = new Date(Date.now());
    let condition = { active: 1 };
    // let condition = { time_td: { $gt: time } };
    // let condition = {last_time: {$gt: now}};
    let totalHinhThuc = [];
    let listJob = await ViecLam.find(condition);
    for (let i = 1; i <= 3; i++) {
      let total = listJob.filter((e) => e.hinh_thuc == i).length;
      totalHinhThuc.push(total);
    }

    //ung vien theo nganh nghe
    // jc_id: {
    //   $lt: 11;
    // }
    let nganhNghe = await JobCategory.find({}, { jc_id: 1, jc_name: 1 })
      .sort({ jc_id: 1 })
      // .limit(10)
      .lean();
    for (let i = 0; i < nganhNghe.length; i++) {
      let total = listJob.filter((e) => {
        if (e.nganh_nghe) {
          let arr_nn = e.nganh_nghe.split(", ");
          let check = arr_nn.includes(String(nganhNghe[i].jc_id));
          if (check) return true;
        }
        return false;
      });
      nganhNghe[i].total = total.length;
    }
    //ung vien theo tinh thanh
    let totaTinhThanh = [];
    let tinhThanh = await City2.find(
      { cit_parent: 0 },
      { cit_id: 1, cit_name: 1 }
    )
      .sort({ cit_id: 1 })
      .lean();
    for (let i = 0; i < tinhThanh.length; i++) {
      let total = listJob.filter(
        (e) => e.dia_diem == tinhThanh[i].cit_id
      ).length;
      if (total < 1) continue;
      tinhThanh[i].total = total;
      totaTinhThanh.push(tinhThanh[i]);
    }
    return functions.success(
      res,
      "Thong ke viec lam theo hinh thuc, nganh nghe, tinh thanh",
      { totalHinhThuc, totaNganhNghe: nganhNghe, totaTinhThanh }
    );
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.thongKeDanhSachViecLam = async (req, res, next) => {
  try {
    let { page, pageSize, id_nganh, id_hinhthuc, id_city, district, key, tag } =
      req.body;
    // console.log("req.body", req.body);
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;

    let time = functions.convertTimestamp(Date.now());
    time = time - 86400;
    let now = new Date(Date.now());
    // let condition = {};
    // let condition = { time_td: { $gt: time } };
    let condition = { active: 1 };
    // let condition = {last_time: {$gt: now}};
    let listBlog = [];
    if (key) {
      let arr_key = key.split(" ");
      let orCondition = [];
      console.log("arr_key", arr_key);
      for (let i = 0; i < arr_key.length; i++) {
        orCondition.push({ vi_tri: new RegExp(arr_key[i], "i") });
      }
      // condition = { last_time: { $gt: now }, $or: orCondition };
      condition = { $or: orCondition };
    }
    if (id_nganh) {
      condition["nganh_nghe"] = new RegExp(`\\b${id_nganh}\\b`);
      let blog = await JobCategory.findOne({ jc_id: Number(id_nganh) });
      if (blog) listBlog.push(blog);
    }
    if (id_hinhthuc) condition["hinh_thuc"] = Number(id_hinhthuc);
    if (id_city) {
      // condition["dia_diem"] = new RegExp(`\\b${id_city}\\b`);
      condition.dia_diem = Number(id_city);
      let blog = await City2.findOne({ cit_id: Number(id_city) });
      if (blog) listBlog.push(blog);
    }
    if (district) {
      condition.quan_huyen = Number(district);
      let blog = await City2.findOne({
        cit_id: Number(district),
        cit_parent: { $gt: 0 },
      });
      if (blog) listBlog.push(blog);
    }
    if (tag) {
      condition.nganh_nghe = new RegExp(`\\b${tag}\\b`);
      let blog = await JobCategory.findOne({ jc_id: Number(tag) });
      if (blog) listBlog.push(blog);
    }
    let danhSachViecLam = await ViecLam.aggregate([
      { $match: condition },
      { $skip: skip },
      { $limit: pageSize },
      { $sort: { created_at: -1 } },
      {
        $lookup: {
          from: "Users",
          localField: "id_ntd",
          foreignField: "_id",
          pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 1 } }],
          as: "NTD",
        },
      },
      { $unwind: { path: "$NTD", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id_vieclam: "$id_vieclam",
          vi_tri: "$vi_tri",
          alias: "$alias",
          dia_diem: "$dia_diem",
          quan_huyen: "$quan_huyen",
          hinh_thuc: "$hinh_thuc",
          muc_luong: "$muc_luong",
          ht_luong: "$ht_luong",
          luong_first: "$luong_first",
          luong: "$luong",
          luong_last: "$luong_last",
          time_td: "$time_td",
          tra_luong: "$tra_luong",
          nganh_nghe: "$nganh_nghe",
          id_ntd: "$id_ntd",
          ntd_avatar: "$NTD.avatarUser",
          ntd_address: "$NTD.address",
          ntd_userName: "$NTD.userName",
          ntd_createdAt: "$NTD.createdAt",
        },
      },
    ]);
    console.log("danhSachViecLam::", danhSachViecLam);
    for (let i = 0; i < danhSachViecLam.length; i++) {
      danhSachViecLam[i].linkAvatar = functions.getLinkFile(
        "user_ntd",
        danhSachViecLam[i].ntd_createdAt,
        danhSachViecLam[i].ntd_avatar
      );
    }
    let total = await functions.findCount(ViecLam, condition);

    return functions.success(
      res,
      "Thong ke danh sach viec lam theo hinh thuc, nganh nghe, tinh thanh",
      { total, listBlog, data: danhSachViecLam }
    );
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.viecLamTheoHinhThuc = async (req, res, next) => {
  try {
    let data = [];
    let time = functions.convertTimestamp(Date.now());
    time = time - 86400;
    for (let i = 1; i <= 3; i++) {
      let condition = { time_td: { $gt: time }, hinh_thuc: i, active: 1 };
      let total = await functions.findCount(ViecLam, condition);
      let danhSachVieclam = await ViecLam.aggregate([
        { $match: condition },
        { $sort: { id_vieclam: -1 } },
        {
          $lookup: {
            from: "Users",
            localField: "id_ntd",
            foreignField: "_id",
            pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 1 } }],
            as: "NTD",
          },
        },
        { $unwind: { path: "$NTD", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id_vieclam: "$id_vieclam",
            vi_tri: "$vi_tri",
            alias: "$alias",
            dia_diem: "$dia_diem",
            quan_huyen: "$quan_huyen",
            hinh_thuc: "$hinh_thuc",
            muc_luong: "$muc_luong",
            tra_luong: "$tra_luong",
            nganh_nghe: "$nganh_nghe",
            id_ntd: "$id_ntd",
            ntd_avatar: "$NTD.avatarUser",
            ntd_address: "$NTD.address",
            ntd_userName: "$NTD.userName",
            ntd_createdAt: "$NTD.createdAt",
          },
        },
      ]);
      data.push({ total, danhSachVieclam });
    }
    return functions.success(res, "danh sach viec lam theo hinh thuc", {
      data: data,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.viecLamTheoNganhNghe = async (req, res, next) => {
  try {
    let time = functions.convertTimestamp(Date.now());
    time = time - 86400;
    let nganhNghe = await JobCategory.find(
      { jc_id: { $lt: 11 } },
      { jc_id: 1, jc_name: 1 }
    )
      .sort({ jc_id: 1 })
      .limit(10)
      .lean();
    for (let i = 0; i < nganhNghe.length; i++) {
      let condition = {
        time_td: { $gt: time },
        nganh_nghe: new RegExp(nganhNghe[i].jc_id, "i"),
        active: 1,
      };
      let total = await functions.findCount(ViecLam, condition);
      let danhSachVieclam = await ViecLam.aggregate([
        { $match: condition },
        { $sort: { id_vieclam: -1 } },
        {
          $lookup: {
            from: "Users",
            localField: "id_ntd",
            foreignField: "_id",
            pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 1 } }],
            as: "NTD",
          },
        },
        { $unwind: { path: "$NTD", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id_vieclam: "$id_vieclam",
            vi_tri: "$vi_tri",
            alias: "$alias",
            dia_diem: "$dia_diem",
            quan_huyen: "$quan_huyen",
            hinh_thuc: "$hinh_thuc",
            muc_luong: "$muc_luong",
            tra_luong: "$tra_luong",
            nganh_nghe: "$nganh_nghe",
            id_ntd: "$id_ntd",
            ntd_avatar: "$NTD.avatarUser",
            ntd_address: "$NTD.address",
            ntd_userName: "$NTD.userName",
            ntd_createdAt: "$NTD.createdAt",
          },
        },
      ]);
      nganhNghe[i].total = total;
      nganhNghe[i].danhSachVieclam = danhSachVieclam;
    }
    return functions.success(res, "danh sach viec lam theo gio", {
      data: nganhNghe,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.viecLamTheoTinhThanh = async (req, res, next) => {
  try {
    let time = functions.convertTimestamp(Date.now());
    time = time - 86400;
    let tinhThanh = await City2.find({}, { cit_id: 1, cit_name: 1 }).lean();
    let data = [];
    for (let i = 0; i < tinhThanh.length; i++) {
      let condition = {
        time_td: { $gt: time },
        dia_diem: new RegExp(tinhThanh[i]._id, "i"),
        active: 1,
      };
      let total = await functions.findCount(ViecLam, condition);
      if (total < 1) continue;
      let danhSachVieclam = await ViecLam.aggregate([
        { $match: condition },
        { $sort: { id_vieclam: -1 } },
        {
          $lookup: {
            from: "Users",
            localField: "id_ntd",
            foreignField: "_id",
            pipeline: [{ $match: { _id: { $nin: [0, null] }, type: 1 } }],
            as: "NTD",
          },
        },
        { $unwind: { path: "$NTD", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id_vieclam: "$id_vieclam",
            vi_tri: "$vi_tri",
            alias: "$alias",
            dia_diem: "$dia_diem",
            quan_huyen: "$quan_huyen",
            hinh_thuc: "$hinh_thuc",
            muc_luong: "$muc_luong",
            tra_luong: "$tra_luong",
            nganh_nghe: "$nganh_nghe",
            id_ntd: "$id_ntd",
            ntd_avatar: "$NTD.avatarUser",
            ntd_address: "$NTD.address",
            ntd_userName: "$NTD.userName",
            ntd_createdAt: "$NTD.createdAt",
          },
        },
      ]);
      tinhThanh[i].total = total;
      tinhThanh[i].danhSachVieclam = danhSachVieclam;
      data.push(tinhThanh[i]);
    }
    return functions.success(res, "danh sach viec lam theo gio", {
      data: data,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.getInfoCompany = async (req, res, next) => {
  try {
    let { id_ntd, page, pageSize } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 5;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    if (id_ntd) {
      id_ntd = Number(id_ntd);
      let ntd = await Users.findOne(
        { _id: id_ntd, type: 1, inforVLTG: { $ne: null } },
        {
          _id: "$_id",
          userName: "$userName",
          address: "$address",
          phone: "$phone",
          avatarUser: "$avatarUser",
          createdAt: "$createdAt",
          com_size: "$inForCompany.com_size",
          description: "$inForCompany.description",
          usc_website: "$inForCompany.timviec365.usc_website",
        }
      ).lean();
      if (ntd) {
        let linkAvatar = functions.getLinkFile(
          "user_ntd",
          ntd.createdAt,
          ntd.avatarUser
        );
        ntd.linkAvatar = linkAvatar;
        let field = {
          id_vieclam: 1,
          vi_tri: 1,
          dia_diem: 1,
          quan_huyen: 1,
          alias: 1,
          hoc_van: 1,
          tra_luong: 1,
          hinh_thuc: 1,
          muc_luong: 1,
          nganh_nghe: 1,
          cap_bac: 1,
          last_time: 1,
          time_td: 1,
          mo_ta: 1,
          gender: 1,
        };
        // let listJob = await functions.pageFindWithFields(ViecLam, {id_ntd: id_ntd}, field, {time_td: -1}, skip, pageSize);
        //viec lam cung nha tuyen dung
        let listJob = await ViecLam.aggregate([
          { $match: { id_ntd: id_ntd } },
          { $sort: { time_td: -1 } },
          { $skip: skip },
          { $limit: pageSize },
          {
            $lookup: {
              from: "VLTG_City2",
              localField: "dia_diem",
              foreignField: "cit_id",
              as: "City",
            },
          },
          { $unwind: { path: "$City", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "VLTG_City2",
              localField: "quan_huyen",
              foreignField: "cit_id",
              as: "District",
            },
          },
          { $unwind: { path: "$District", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              id_vieclam: "$id_vieclam",
              vi_tri: "$vi_tri",
              alias: "$alias",
              dia_diem: "$dia_diem",
              quan_huyen: "$quan_huyen",
              hoc_van: "$hoc_van",
              hinh_thuc: "$hinh_thuc",
              muc_luong: "$muc_luong",
              tra_luong: "$tra_luong",
              nganh_nghe: "$nganh_nghe",
              cap_bac: "$cap_bac",
              last_time: "$last_time",
              time_td: "$time_td",
              mo_ta: "$mo_ta",
              gender: "$gender",
              City: "$City.cit_name",
              District: "$District.cit_name",
            },
          },
        ]);
        for (let i = 0; i < listJob.length; i++) {
          //ten nganh nghe
          let arr_nganh = listJob[i].nganh_nghe;
          let tenNganhNghe = [];
          if (arr_nganh) {
            arr_nganh = arr_nganh.split(", ");
            for (let i = 0; i < arr_nganh.length; i++) {
              let id_nganh = Number(arr_nganh[i]);
              if (id_nganh) {
                let tenNganh = await JobCategory.findOne(
                  { jc_id: id_nganh },
                  { jc_id: 1, jc_name: 1 }
                ).lean();
                if (tenNganh) {
                  tenNganhNghe.push(tenNganh);
                }
              }
            }
          }
          listJob[i].tenNganhNghe = tenNganhNghe;
        }
        let total = await functions.findCount(ViecLam, { id_ntd: id_ntd });
        return functions.success(res, "get info ntd sucess", {
          ntd,
          total,
          listJob,
        });
      }
      return functions.setError(res, "Ntd not found!");
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};
