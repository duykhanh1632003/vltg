const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UvKnlvSchema = new Schema({
    id_knlv: {
        type: Number,
        required: true,
    },
    id_uv_knlv: {
        type: Number,
        required: true,
    },
    chuc_danh: {
        type: String,
        default: null,
    },
    time_fist: {
        type: Date,
        default: null,
    },
    time_end: {
        type: Date,
        default: null,
    },
    cty_name: {
        type: String,
        default: null,
    },
    mota: {
        type: String,
        default: null,
    },
},{
    collection: 'VLTG_UvKnlv',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_UvKnlv",UvKnlvSchema);
