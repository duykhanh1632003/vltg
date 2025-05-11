const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NtdSaveUvSchema = new Schema({
    id: {
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
    created_at: {
        type: Date,
        default: null,
    }
},{
    collection: 'VLTG_NtdSaveUv',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_NtdSaveUv",NtdSaveUvSchema);
