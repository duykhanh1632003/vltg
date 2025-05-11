const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UvCvmmSchema = new Schema({
    id_uv_cvmm: {
        type: Number,
        required: true,
    },
    cong_viec: {
        type: String,
        default: null,
    },
    nganh_nghe: {
        type: String,
        default: null,
    },
    dia_diem: {
        type: String,
        default: null,
    },
    lever: {
        type: String,
        default: null,
    },
    hinh_thuc: {
        type: Number,
        default: 0,
    },
    luong: {
        type: Number,
        default: 0,
    },
    ky_nang: {
        type: String,
        default: null,
    },
},{
    collection: 'VLTG_UvCvmm',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_UvCvmm",UvCvmmSchema);
