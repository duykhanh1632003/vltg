const express = require("express");
const router = express.Router();
const toolVLTG = require("./vieclamtheogio/tool");
const manageAccountCandidate = require("./vieclamtheogio/manageAccountCandidate");
const manageAccountCompany = require("./vieclamtheogio/manageAccountCompany");
const viecLam = require("./vieclamtheogio/viecLam");
const admin = require("./vieclamtheogio/admin");
const authentication = require("./vieclamtheogio/authentication");

router.use("/tool", toolVLTG);
router.use("/manageAccountCandidate", manageAccountCandidate);
router.use("/manageAccountCompany", manageAccountCompany);
router.use("/viecLam", viecLam);
router.use("/admin", admin);
router.use("/authentication", authentication);

module.exports = router;
