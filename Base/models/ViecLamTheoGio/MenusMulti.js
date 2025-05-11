const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MenusMultiSchema = new Schema({
    mnu_id: {
        type: Number,
        required: true,
    },
    mnu_name: {
        type: String,
        default: null,
    },
    mnu_name_index: {
        type: String,
        default: null,
    },
    mnu_check: {
        type: String,
        default: null,
    },
    mnu_link: {
        type: String,
        default: null,
    },
    mnu_target: {
        type: String,
        default: null,
    },
    mnu_description: {
        type: String,
        default: null,
    },
    mnu_data: {
        type: String,
        default: null,
    },
    admin_id: {
        type: Number,
        required: true,
    },
    lang_id: {
        type: Number,
        default: 0,
    },
    mnu_active: {
        type: Number,
        default: 0,
    },
    mnu_follow: {
        type: Number,
        default: 0,
    },
    mnu_type: {
        type: Number,
        default: 0,
    },
    mnu_date: {
        type: Number,
        default: 0,
    },
    mnu_order: {
        type: Number,
        default: 0,
    },
    mnu_parent_id: {
        type: Number,
        default: 0,
    },
    mnu_has_child: {
        type: Number,
        default: 0,
    },
    mnu_background: {
        type: String,
        default: null,
    },
    mnu_padding_left: {
        type: Number,
        default: 0,
    },
},{
    collection: 'VLTG_MenusMulti',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_MenusMulti",MenusMultiSchema);
