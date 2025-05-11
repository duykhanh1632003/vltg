var express = require("express");
var router = express.Router();
var authentication = require("../../controllers/vieclamtheogio/authentication");
var formData = require("express-form-data");

//danh sach nganh nghe
router.post("/sendOTP", formData.parse(), authentication.sendOTP);
router.post("/verifyOTP", formData.parse(), authentication.verifyOTP);

module.exports = router;
