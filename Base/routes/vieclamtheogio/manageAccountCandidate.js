var express = require("express");
var router = express.Router();
var manageAccountCandidate = require("../../controllers/vieclamtheogio/manageAccountCandidate");
var formData = require("express-form-data");
const functions = require("../../services/functions");

//danh sach nganh nghe
router.post(
  "/danhSachNganhNghe",
  formData.parse(),
  manageAccountCandidate.danhSachNganhNghe
);
router.post(
  "/listCityAndDistrict",
  formData.parse(),
  manageAccountCandidate.listCityAndDistrict
);

//lay ra thong tin cong viec mong muon va ky nang ban than
router.post(
  "/getCongViecMongMuon",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.getCongViecMongMuon
);
router.post(
  "/updateCongViecMongMuon",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.updateCongViecMongMuon
);
router.post(
  "/updateKyNangBanThan",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.updateKyNangBanThan
);
//kinh nghiem lam viec
router.post(
  "/getKinhNghiemLamViec",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.getKinhNghiemLamViec
);
router.post(
  "/createKinhNghiemLamViec",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.createKinhNghiemLamViec
);
router.post(
  "/updateKinhNghiemLamViec",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.updateKinhNghiemLamViec
);
router.post(
  "/deleteKinhNghiemLamViec",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.deleteKinhNghiemLamViec
);
//buoi co the di lam
router.post(
  "/getBuoiCoTheDiLam",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.getBuoiCoTheDiLam
);
router.post(
  "/updateBuoiCoTheDiLam",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.updateBuoiCoTheDiLam
);

//viec lam da ung tuyen
router.post(
  "/getViecLamDaUngTuyen",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.getViecLamDaUngTuyen
);
router.post(
  "/deleteViecLamDaUngTuyen",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.deleteViecLamDaUngTuyen
);

//viec lam da luu
router.post(
  "/getViecLamDaLuu",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.getViecLamDaLuu
);
router.post(
  "/deleteViecLamDaLuu",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.deleteViecLamDaLuu
);

//xu ly cac chuc nang lien quan
router.post(
  "/nhanViec",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.nhanViec
);
router.post(
  "/luuViecLam",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.luuViecLam
);
router.post(
  "/lamMoiUngVien",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.lamMoiUngVien
);

//thong tin ung vien
router.post(
  "/getInfoCandidate",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.getInfoCandidate
);
router.post(
  "/updateInfoCandidate",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.updateInfoCandidate
);
router.post(
  "/updateAvatarCandidate",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.updateAvatarCandidate
);
router.post(
  "/updateStatusSearch",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.updateStatusSearch
);

router.post(
  "/updateInfo",
  functions.checkToken,
  functions.checkCandidate,
  formData.parse(),
  manageAccountCandidate.updateInfo
);

module.exports = router;
