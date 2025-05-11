const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminUserRightSchema = new Schema({
    //id
    adu_admin_id: {
        type: Number,
        required: true,
    },
    adu_admin_module_id: {
        type: Number,
        required: true,
    },
    adu_add: {
        type: Number,
        default: 0,
    },
    adu_edit: {
        type: Number,
        default: 0,
    },
    adu_delete: {
        type: Number,
        default: 0,
    },
},{
    collection: 'VLTG_AdminUserRight',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_AdminUserRight",AdminUserRightSchema);
