var express = require("express");
var router = express.Router();
var viecLam = require("../../controllers/vieclamtheogio/viecLam");
var formData = require("express-form-data");
const functions = require("../../services/functions");

//danh sach nganh nghe
router.post("/danhSachViecLam", formData.parse(), viecLam.danhSachViecLam);
router.post(
  "/timKiemViecLam",
  formData.parse(),
  viecLam.thongKeDanhSachViecLam
);
  router.post(
    "/chiTietViecLamSauDN",
    formData.parse(),
    functions.checkToken,
    viecLam.danhSachViecLam
  );
router.post(
  "/chiTietViecLamTruocDN",
  formData.parse(),
  viecLam.danhSachViecLam
);
router.post("/tuKhoaLienQuan", formData.parse(), viecLam.tuKhoaLienQuan);
router.post("/trangChu", formData.parse(), viecLam.trangChu);
router.post(
  "/trangChuSauDN",
  formData.parse(),
  functions.checkToken,
  viecLam.trangChu
);
router.post("/thongKeViecLam", formData.parse(), viecLam.thongKeViecLam);
router.post(
  "/thongKeDanhSachViecLam",
  formData.parse(),
  viecLam.thongKeDanhSachViecLam
);
router.post(
  "/viecLamTheoHinhThuc",
  formData.parse(),
  viecLam.viecLamTheoHinhThuc
);
router.post(
  "/viecLamTheoNganhNghe",
  formData.parse(),
  viecLam.viecLamTheoNganhNghe
);
router.post(
  "/viecLamTheoTinhThanh",
  formData.parse(),
  viecLam.viecLamTheoTinhThanh
);
router.post("/getInfoCompany", formData.parse(), viecLam.getInfoCompany);

module.exports = router;
