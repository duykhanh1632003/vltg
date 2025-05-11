var express = require("express");
var router = express.Router();
var manageAccountCompany = require("../../controllers/vieclamtheogio/manageAccountCompany");
var admin = require("../../controllers/vieclamtheogio/admin");
var formData = require("express-form-data");
const functions = require("../../services/functions");

//------auth
router.post("/register", formData.parse(), manageAccountCompany.register);
router.post("/login", formData.parse(), manageAccountCompany.login);
router.post(
  "/forgotPassword",
  formData.parse(),
  manageAccountCompany.forgotPassword
);
// router.post("/resetPassword", formData.parse(), manageAccountCompany.resetPassword);
router.post(
  "/changePassword",
  functions.checkToken,
  formData.parse(),
  manageAccountCompany.changePassword
);
router.post("/setPassword", formData.parse(), manageAccountCompany.setPassword);

//------tin tuyen dung
router.post(
  "/danhSachTinTuyenDungMoi",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.danhSachTinTuyenDungMoi
);
router.post(
  "/quanLyChung",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.quanLyChung
);
router.post(
  "/dangTin",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.dangTin
);
router.post(
  "/danhSachTinDaDang",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.danhSachTinDaDang
);
router.post(
  "/suaTin",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.suaTin
);
router.post(
  "/lamMoiTin",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.lamMoiTin
);

router.post(
  "/activeTin",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  admin.activeTin
);

//------ung vien moi ung tuyen
router.post(
  "/ungVienMoiUngTuyen",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.ungVienMoiUngTuyen
);
router.post(
  "/updateStatusUngTuyen",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.updateStatusUngTuyen
);
router.post(
  "/updateGhiChuUngTuyen",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.updateGhiChuUngTuyen
);

//------ung vien tu diem loc(da xem thong tin lien he cua ung vien)
router.post(
  "/ungVienTuDiemLoc",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.ungVienTuDiemLoc
);
router.post(
  "/updateKetQuaNtdXemUv",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.updateKetQuaNtdXemUv
);
router.post(
  "/updateGhiChuNtdXemUv",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.updateGhiChuNtdXemUv
);
router.post(
  "/getDiem",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.getDiem
);
router.post(
  "/ntdXemUv",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.ntdXemUv
);
router.post(
  "/congThemDiem",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.congThemDiem
);

//------ung vien da xem(da xem chi tiet)
router.post(
  "/ungVienDaXem",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.ungVienDaXem
);
router.post(
  "/xoaUngVienDaXem",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.xoaUngVienDaXem
);

//-----ung vien da luu
router.post(
  "/ungVienDaLuu",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.ungVienDaLuu
);
router.post(
  "/xoaUngVienDaLuu",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.xoaUngVienDaLuu
);
router.post(
  "/ntdSaveUv",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.ntdSaveUv
);

//-----ung vien theo gio
router.post(
  "/thongKeUngVien",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.thongKeUngVien
);
router.post(
  "/thongKeDanhSachUngVien",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.thongKeDanhSachUngVien
);
router.post(
  "/chiTietUngVien",
  formData.parse(),
  manageAccountCompany.chiTietUngVien
);
router.post(
  "/ntdXemChiTietUngVien",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.chiTietUngVien
);

//-----quan ly tai khoan
router.post(
  "/getInfoCompany",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.getInfoCompany
);
router.post(
  "/updateInfoCompany",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.updateInfoCompany
);
router.post(
  "/updateAvatarCompany",
  functions.checkToken,
  functions.checkCompany,
  formData.parse(),
  manageAccountCompany.updateAvatarCompany
);

module.exports = router;
