const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminUserSchema = new Schema({
    //id
    adm_id: {
        type: Number,
        required: true,
    },
    adm_loginname: {
        type: String,
        required: true,
    },
    adm_password: {
        type: String,
        required: true,
    },
    adm_name: {
        type: String,
        default: null,
    },
    adm_email: {
        type: String,
        default: null,
    },
    adm_author: {
        type: String,
        default: null,
    },
    adm_address: {
        type: String,
        default: null,
    },
    adm_phone: {
        type: String,
        default: null,
    },
    adm_mobile: {
        type: String,
        default: null,
    },
    adm_access_module: {
        type: String,
        default: null,
    },
    adm_access_category: {
        type: String,
        default: null,
    },
    adm_date: {
        type: Number,
        default: 0,
    },
    adm_isadmin: {
        type: Number,
        default: 0,
    },
    adm_active: {
        type: Number,
        default: 0,
    },
    lang_id: {
        type: Number,
        default: 0,
    },
    adm_delete: {
        type: Number,
        default: 0,
    },
    adm_all_category: {
        type: Number,
        default: 0,
    },
    adm_edit_all: {
        type: Number,
        default: 0,
    },
    admin_id: {
        type: Number,
        required: false,
    },
    adm_bophan: {
        type: Number,
        default: 0,
    },
    adm_ntd: {
        type: Number,
        default: 0,
    },
    adm_rank: {
        type: Number,
        default: 0,
    },
},{
    collection: 'VLTG_AdminUser',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_AdminUser",AdminUserSchema);
