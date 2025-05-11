var express = require('express');
var router = express.Router();
var toolVLTG =  require('../../controllers/vieclamtheogio/toolVLTG');

router.post('/admin_comment', toolVLTG.admin_comment);
router.post('/admin_menu_order', toolVLTG.admin_menu_order);
router.post('/admin_translate', toolVLTG.admin_translate);
router.post('/admin_user', toolVLTG.admin_user);
router.post('/admin_user_language', toolVLTG.admin_user_language);
router.post('/admin_user_right', toolVLTG.admin_user_right);
router.post('/city2', toolVLTG.city2);
router.post('/job_category', toolVLTG.job_category);
router.post('/list_ca_lamviec', toolVLTG.list_ca_lamviec);
router.post('/menus_multi', toolVLTG.menus_multi);
router.post('/modules', toolVLTG.modules);
router.post('/ntd_save_uv', toolVLTG.ntd_save_uv);
router.post('/ntd_xem_uv', toolVLTG.ntd_xem_uv);
router.post('/tbl_comment', toolVLTG.tbl_comment);
router.post('/thongbao_ntd', toolVLTG.thongbao_ntd);
router.post('/thongbao_uv', toolVLTG.thongbao_uv);
router.post('/ungtuyen', toolVLTG.ungtuyen);
router.post('/uv_cvmm', toolVLTG.uv_cvmm);
router.post('/uv_knlv', toolVLTG.uv_knlv);
router.post('/uv_save_vl', toolVLTG.uv_save_vl);
router.post('/vieclam', toolVLTG.vieclam);
router.post('/xem_uv', toolVLTG.xem_uv);

module.exports = router;