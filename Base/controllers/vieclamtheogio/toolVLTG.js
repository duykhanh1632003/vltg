const functions = require('../../services/functions');
const VLTG_AdminComment = require('../../models/ViecLamTheoGio/AdminComment');
const VLTG_AdminMenuOrder = require('../../models/ViecLamTheoGio/AdminMenuOrder');
const VLTG_AdminTranslate = require('../../models/ViecLamTheoGio/AdminTranslate');
const VLTG_AdminUser = require('../../models/ViecLamTheoGio/AdminUser');
const VLTG_AdminUserLanguage = require('../../models/ViecLamTheoGio/AdminUserLanguage');
const VLTG_AdminUserRight = require('../../models/ViecLamTheoGio/AdminUserRight');
const VLTG_City2 = require('../../models/ViecLamTheoGio/City2');
const VLTG_JobCategory = require('../../models/ViecLamTheoGio/JobCategory');
const VLTG_CaLamViec = require('../../models/ViecLamTheoGio/CaLamViec');
const VLTG_MenusMulti = require('../../models/ViecLamTheoGio/MenusMulti');
const VLTG_Modules = require('../../models/ViecLamTheoGio/Modules');
const VLTG_NtdSaveUv = require('../../models/ViecLamTheoGio/NtdSaveUv');
const VLTG_NtdXemUv = require('../../models/ViecLamTheoGio/NtdXemUv');
const VLTG_TblCommnet = require('../../models/ViecLamTheoGio/TblComment');
const VLTG_ThongBaoNtd = require('../../models/ViecLamTheoGio/ThongBaoNtd');
const VLTG_ThongBaoUv = require('../../models/ViecLamTheoGio/ThongBaoUv');
const VLTG_UngTuyen = require('../../models/ViecLamTheoGio/UngTuyen');
const VLTG_UvCvmm = require('../../models/ViecLamTheoGio/UvCvmm');
const VLTG_UvKnlv = require('../../models/ViecLamTheoGio/UvKnlv');
const VLTG_UvSaveVl = require('../../models/ViecLamTheoGio/UvSaveVl');
const VLTG_ViecLam = require('../../models/ViecLamTheoGio/ViecLam');
const VLTG_XemUv = require('../../models/ViecLamTheoGio/XemUv');

exports.admin_comment = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 1 });   
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_AdminComment.findOneAndUpdate({ admc_id: Number(data[i].admc_id) }, {
                        admc_comment: data[i].admc_comment,
                        admc_date: data[i].admc_date,
                        admin_id: data[i].admin_id,
                        admc_keyword: data[i].admc_keyword,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.admin_menu_order = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 2 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_AdminMenuOrder.findOneAndUpdate({ amo_admin: Number(data[i].amo_admin), amo_module: Number(data[i].amo_module) }, {
                        amo_order: data[i].amo_order,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.admin_translate = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 3 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_AdminTranslate.findOneAndUpdate({ tra_keyword: data[i].tra_keyword }, {
                        tra_text: data[i].tra_text, 
                        lang_id: data[i].lang_id, 
                        tra_source: data[i].tra_source, 
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.admin_user = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 4 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_AdminUser.findOneAndUpdate({ adm_id: Number(data[i].adm_id) }, {
                        adm_loginname: data[i].adm_loginname,
                        adm_password: data[i].adm_password,
                        adm_name: data[i].adm_name,
                        adm_email: data[i].adm_email,
                        adm_author: data[i].adm_author,
                        adm_address: data[i].adm_address,
                        adm_phone: data[i].adm_phone,
                        adm_mobile: data[i].adm_mobile,
                        adm_access_module: data[i].adm_access_module,
                        adm_access_category: data[i].adm_access_category,
                        adm_date: data[i].adm_date,
                        adm_isadmin: data[i].adm_isadmin,
                        adm_active: data[i].adm_active,
                        lang_id: data[i].lang_id,
                        adm_delete: data[i].adm_delete,
                        adm_all_category: data[i].adm_all_category,
                        adm_edit_all: data[i].adm_edit_all,
                        admin_id: data[i].admin_id,
                        adm_bophan: data[i].adm_bophan,
                        adm_ntd: data[i].adm_ntd,
                        adm_rank: data[i].adm_rank,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.admin_user_language = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 5 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_AdminUserLanguage.findOneAndUpdate({ aul_admin_id: Number(data[i].aul_admin_id), aul_lang_id: Number(data[i].aul_lang_id)}, {
                        aul_admin_id: data[i].aul_admin_id,
                        aul_lang_id: data[i].aul_lang_id,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.admin_user_right = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 6 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_AdminUserRight.findOneAndUpdate({ adu_admin_id: Number(data[i].adu_admin_id), adu_admin_module_id: Number(data[i].adu_admin_module_id) }, {
                        adu_add: data[i].adu_add,
                        adu_edit: data[i].adu_edit,
                        adu_delete: data[i].adu_delete,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.city2 = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 7 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_City2.findOneAndUpdate({ cit_id: Number(data[i].cit_id) }, {
                        cit_name: data[i].cit_name,
                        cit_order: data[i].cit_order,
                        cit_type: data[i].cit_type,
                        cit_count: data[i].cit_count,
                        cit_parent: data[i].cit_parent,
                        cit_bv: data[i].cit_bv,
                        cit_ndgy: data[i].cit_ndgy,
                        cit_tdgy: data[i].cit_tdgy,
                        cit_time: data[i].cit_time,
                        cit_tag: data[i].cit_tag,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

//nganh nghe
exports.job_category = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 14 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_JobCategory.findOneAndUpdate({ jc_id: Number(data[i].jc_id) }, {
                        jc_name: data[i].jc_name,
                        jc_title: data[i].jc_title,
                        jc_description: data[i].jc_description,
                        jc_bv: data[i].jc_bv,
                        jc_link: data[i].jc_link,
                        key_tdgy: data[i].key_tdgy,
                        key_ndgy: data[i].key_ndgy,
                        jc_keyword: data[i].jc_keyword,
                        jc_mota: data[i].jc_mota,
                        jc_parent: data[i].jc_parent,
                        jc_order: data[i].jc_order,
                        jc_active: data[i].jc_active,
                        jc_search: data[i].jc_search,
                        jc_type: data[i].jc_type,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

//ca lam viec
exports.list_ca_lamviec = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 15 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_CaLamViec.findOneAndUpdate({ ca_id: Number(data[i].ca_id) }, {
                        ca_id_viec: data[i].ca_id_viec,
                        ca_start_time: data[i].ca_start_time,
                        ca_end_time: data[i].ca_end_time,
                        day: data[i].day,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

//
exports.menus_multi = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 16 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_MenusMulti.findOneAndUpdate({ mnu_id: Number(data[i].mnu_id) }, {
                        mnu_name: data[i].mnu_name,
                        mnu_name_index: data[i].mnu_name_index,
                        mnu_check: data[i].mnu_check,
                        mnu_link: data[i].mnu_link,
                        mnu_target: data[i].mnu_target,
                        mnu_description: data[i].mnu_description,
                        mnu_data: data[i].mnu_data,
                        admin_id: data[i].admin_id,
                        lang_id: data[i].lang_id,
                        mnu_active: data[i].mnu_active,
                        mnu_follow: data[i].mnu_follow,
                        mnu_type: data[i].mnu_type,
                        mnu_date: data[i].mnu_date,
                        mnu_order: data[i].mnu_order,
                        mnu_parent_id: data[i].mnu_parent_id,
                        mnu_has_child: data[i].mnu_has_child,
                        mnu_background: data[i].mnu_background,
                        mnu_padding_left: data[i].mnu_padding_left,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.modules = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 17 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_Modules.findOneAndUpdate({ mod_id: Number(data[i].mod_id) }, {
                        mod_path: data[i].mod_path,
                        mod_listname: data[i].mod_listname,
                        mod_listfile: data[i].mod_listfile,
                        mod_order: data[i].mod_order,
                        mod_help: data[i].mod_help,
                        lang_id: data[i].lang_id,
                        mod_checkloca: data[i].mod_checkloca,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.ntd_save_uv = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 18 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_NtdSaveUv.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id_ntd: data[i].id_ntd,
                        id_uv: data[i].id_uv,
                        created_at: data[i].created_at,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.ntd_xem_uv = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 19 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_NtdXemUv.findOneAndUpdate({ stt: Number(data[i].stt) }, {
                        id_ntd: data[i].id_ntd,
                        id_uv: data[i].id_uv,
                        ket_qua: data[i].ket_qua,
                        time_created: data[i].time_created,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.tbl_comment = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 20 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_TblCommnet.findOneAndUpdate({ cm_id: Number(data[i].cm_id) }, {
                        url_cm: data[i].url_cm,
                        parent_cm_id: data[i].parent_cm_id,
                        comment: data[i].comment,
                        comment_sender_name: data[i].comment_sender_name,
                        ip_cm: data[i].ip_cm,
                        time_cm: data[i].time_cm,
                        reply: data[i].reply,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.thongbao_ntd = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 21 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_ThongBaoNtd.findOneAndUpdate({ tb_id: Number(data[i].tb_id) }, {
                        td_uv: data[i].td_uv,
                        td_ntd: data[i].td_ntd,
                        tb_name: data[i].tb_name,
                        tb_avatar: data[i].tb_avatar,
                        created_at: data[i].created_at,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.thongbao_uv = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 22 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_ThongBaoUv.findOneAndUpdate({ tb_id: Number(data[i].tb_id) }, {
                        td_uv: data[i].td_uv,
                        td_ntd: data[i].td_ntd,
                        tb_name: data[i].tb_name,
                        tb_avatar: data[i].tb_avatar,
                        created_at: data[i].created_at,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.ungtuyen = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 23 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_UngTuyen.findOneAndUpdate({ id_ungtuyen: Number(data[i].id_ungtuyen) }, {
                        id_uv: data[i].id_uv,
                        id_ntd: data[i].id_ntd,
                        id_viec: data[i].id_viec,
                        ca_lam: data[i].ca_lam,
                        gio_lam: data[i].gio_lam,
                        day: data[i].day,
                        ghi_chu: data[i].ghi_chu,
                        status: data[i].status,
                        created_at: data[i].created_at,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};


exports.uv_cvmm = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 24 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_UvCvmm.findOneAndUpdate({ id_uv_cvmm: Number(data[i].id_uv_cvmm) }, {
                        cong_viec: data[i].cong_viec,
                        nganh_nghe: data[i].nganh_nghe,
                        dia_diem: data[i].dia_diem,
                        lever: data[i].lever,
                        hinh_thuc: data[i].hinh_thuc,
                        luong: data[i].luong,
                        ky_nang: data[i].ky_nang,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.uv_knlv = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 25 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_UvKnlv.findOneAndUpdate({ id_knlv: Number(data[i].id_knlv) }, {
                        id_uv_knlv: data[i].id_uv_knlv,
                        chuc_danh: data[i].chuc_danh,
                        time_fist: data[i].time_fist,
                        time_end: data[i].time_end,
                        cty_name: data[i].cty_name,
                        mota: data[i].mota,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.uv_save_vl = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 26 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_UvSaveVl.findOneAndUpdate({ id: Number(data[i].id) }, {
                        id_uv: data[i].id_uv,
                        id_viec: data[i].id_viec,
                        ntd_name: data[i].ntd_name,
                        created_at: data[i].created_at,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.vieclam = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 27 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    if(!functions.checkDate(data[i].fist_time) || !functions.checkDate(data[i].last_time)) continue;
                    await VLTG_ViecLam.findOneAndUpdate({ id_vieclam: Number(data[i].id_vieclam) }, {
                        id_ntd: data[i].id_ntd,
                        hoc_van: data[i].hoc_van,
                        tra_luong: data[i].tra_luong,
                        dia_diem: data[i].dia_diem,
                        quan_huyen: data[i].quan_huyen,
                        thoi_gian: data[i].thoi_gian,
                        vi_tri: data[i].vi_tri,
                        alias: data[i].alias,
                        hinh_thuc: data[i].hinh_thuc,
                        muc_luong: data[i].muc_luong,
                        ht_luong: data[i].ht_luong,
                        hoa_hong: data[i].hoa_hong,
                        so_luong: data[i].so_luong,
                        nganh_nghe: data[i].nganh_nghe,
                        cap_bac: data[i].cap_bac,
                        time_td: data[i].time_td,
                        fist_time: data[i].fist_time,
                        last_time: data[i].last_time,
                        mo_ta: data[i].mo_ta,
                        gender: data[i].gender,
                        yeu_cau: data[i].yeu_cau,
                        quyen_loi: data[i].quyen_loi,
                        ho_so: data[i].ho_so,
                        luot_xem: data[i].luot_xem,
                        name_lh: data[i].name_lh,
                        phone_lh: data[i].phone_lh,
                        address_lh: data[i].address_lh,
                        email_lh: data[i].email_lh,
                        vl_created_time: data[i].vl_created_time,
                        active: data[i].active,
                        created_at: data[i].created_at,
                        vl_index: data[i].vl_index,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.xem_uv = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let response = await functions.getDataAxios('https://vieclamtheogio.timviec365.vn/api/list_data.php', { page: page, pb: 28 });
            let data = response.data;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    await VLTG_XemUv.findOneAndUpdate({ xm_id: Number(data[i].xm_id) }, {
                        xm_id_ntd: data[i].xm_id_ntd,
                        xm_id_uv: data[i].xm_id_uv,
                        xm_time_created: data[i].xm_time_created,
                    }, { upsert: true });
                }
                page++;
            } else {
                result = false;
            }
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};