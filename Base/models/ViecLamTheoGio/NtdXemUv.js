const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NtdXemUvSchema = new Schema({
    stt: {
        type: Number,
        required: true,
    },
    id_ntd: {
        type: Number,
        required: true,
    },
    id_uv: {
        type: Number,
        required: true,
    },
    ghi_chu: {
        type: String,
        default: null,
    },
    ket_qua: {
        type: Number,
        default: 0,
    },
    time_created: {
        type: Number,
        default: 0,
    }
},{
    collection: 'VLTG_NtdXemUv',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_NtdXemUv",NtdXemUvSchema);
