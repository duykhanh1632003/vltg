var express = require("express");
var router = express.Router();
var admin = require("../../controllers/vieclamtheogio/admin");
var formData = require("express-form-data");
const functions = require("../../services/functions");

//dang nhap
router.post("/createAdmin", formData.parse(), admin.createAdmin);

router.post("/loginAdmin", formData.parse(), admin.loginAdmin);

router.post(
  "/trangChu",
  functions.checkToken,
  functions.checkAdmin,
  formData.parse(),
  admin.trangChu
);

router.post(
  "/getInfoAdmin",
  functions.checkToken,
  functions.checkAdmin,
  formData.parse(),
  admin.getInfoAdmin
);
router.post(
  "/changeInfoAdminLogin",
  functions.checkToken,
  functions.checkAdmin,
  formData.parse(),
  admin.changeInfoAdminLogin
);
router.post(
  "/changePasswordAdminLogin",
  functions.checkToken,
  functions.checkAdmin,
  formData.parse(),
  admin.changePasswordAdminLogin
);
router.post(
  "/changePasswordAdmin",
  functions.checkToken,
  functions.checkAdmin,
  formData.parse(),
  admin.changePasswordAdmin
);

router.post(
  "/getModules",
  functions.checkToken,
  functions.checkAdmin,
  formData.parse(),
  admin.getModules
);

//danh sach ung vien
router.post(
  "/danhSachUngVien",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(95, 1)],
  formData.parse(),
  admin.danhSachUngVienAndNtd
);

router.post(
  "/getDetailUngVien",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(96, 1)],
  formData.parse(),
  admin.getDetailUngVien
);

router.post(
  "/createUngVien",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(95, 2)],
  formData.parse(),
  admin.createUngVien
);
router.post(
  "/updateUngVien",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(95, 3)],
  formData.parse(),
  admin.updateUngVien
);
router.post(
  "/activeUngVien",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(95, 3)],
  formData.parse(),
  admin.activeUngVien
);
router.post(
  "/deleteUngVien",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(95, 4)],
  formData.parse(),
  admin.deleteManyByModule
);

//danh sach nha tuyen dung
router.post(
  "/danhSachCompany",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(96, 1)],
  formData.parse(),
  admin.danhSachUngVienAndNtd
);
router.post(
  "/createCompany",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(96, 2)],
  formData.parse(),
  admin.createCompany
);
router.post(
  "/updateCompany",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(96, 3)],
  formData.parse(),
  admin.updateCompany
);
router.post(
  "/activeCompany",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(96, 3)],
  formData.parse(),
  admin.activeCompany
);
router.post(
  "/deleteCompany",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(96, 4)],
  formData.parse(),
  admin.deleteManyByModule
);

//danh sach tin
router.post(
  "/danhSachTin",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(97, 1)],
  formData.parse(),
  admin.danhSachTin
);
router.post(
  "/createTin",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(97, 2)],
  formData.parse(),
  admin.createTin
);
router.post(
  "/updateTin",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(97, 3)],
  formData.parse(),
  admin.updateTin
);
router.post(
  "/activeTin",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(97, 3)],
  formData.parse(),
  admin.activeTin
);
router.post(
  "/deleteTin",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(97, 4)],
  formData.parse(),
  admin.deleteManyByModule
);

//danh sach tag
router.post(
  "/danhSachTag",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(94, 1)],
  formData.parse(),
  admin.danhSachTagAndCategory
);
router.post(
  "/createTag",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(94, 2)],
  formData.parse(),
  admin.createTagAndCategory
);
router.post(
  "/updateTag",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(94, 3)],
  formData.parse(),
  admin.updateTagAndCategory
);
router.post(
  "/deleteTag",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(94, 4)],
  formData.parse(),
  admin.deleteManyByModule
);

//danh sach nganh nghe
router.post(
  "/danhSachCategory",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(57, 1)],
  formData.parse(),
  admin.danhSachTagAndCategory
);
router.post(
  "/createCategory",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(57, 2)],
  formData.parse(),
  admin.createTagAndCategory
);
router.post(
  "/updateCategory",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(57, 3)],
  formData.parse(),
  admin.updateTagAndCategory
);
router.post(
  "/deleteCategory",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(57, 4)],
  formData.parse(),
  admin.deleteManyByModule
);

//danh sach tinh thanh
router.post(
  "/danhSachCity",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(38, 1)],
  formData.parse(),
  admin.danhSachCity
);
router.post(
  "/updateCity",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(38, 3)],
  formData.parse(),
  admin.updateCity
);
router.post(
  "/deleteCity",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(38, 4)],
  formData.parse(),
  admin.deleteManyByModule
);

//danh sach quan huyen
router.post(
  "/danhSachDistrict",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(93, 1)],
  formData.parse(),
  admin.danhSachCity
);
router.post(
  "/updateDistrict",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(93, 3)],
  formData.parse(),
  admin.updateCity
);
router.post(
  "/deleteDistrict",
  [functions.checkToken, functions.checkAdmin, functions.checkRight(93, 4)],
  formData.parse(),
  admin.deleteManyByModule
);

module.exports = router;
