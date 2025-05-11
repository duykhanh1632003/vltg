const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UngTuyenSchema = new Schema({
    id_ungtuyen: {
        type: Number,
        required: true,
    },
    id_uv: {
        type: Number,
        required: true,
    },
    id_ntd: {
        type: Number,
        required: true,
    },
    id_viec: {
        type: Number,
        required: true,
    },
    ca_lam: {
        type: String,
        default: null,
    },
    gio_lam: {
        type: String,
        default: null,
    },
    day: {
        type: String,
        default: null,
    },
    ghi_chu: {
        type: String,
        default: null,
    },
    status: {
        type: Number,
        default: 0,
    },
    created_at: {
        type: Date,
        default: null,
    },
},{
    collection: 'VLTG_UngTuyen',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_UngTuyen",UngTuyenSchema);
