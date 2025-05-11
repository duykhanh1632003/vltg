const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const XemUvSchema = new Schema({
    xm_id: {
        type: Number,
        required: true,
    },
    xm_id_ntd: {
        type: Number,
        required: true,
    },
    xm_id_uv: {
        type: Number,
        required: true,
    },
    xm_time_created: {
        type: Number,
        default: 0,
    },
},{
    collection: 'VLTG_XemUv',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_XemUv",XemUvSchema);
