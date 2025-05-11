const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThongBaoNtdSchema = new Schema({
    tb_id: {
        type: Number,
        required: true,
    },
    td_uv: {
        type: Number,
        default: 0,
    },
    td_ntd: {
        type: Number,
        default: 0,
    },
    tb_name: {
        type: String,
        default: null,
    },
    tb_avatar: {
        type: String,
        default: null,
    },
    created_at: {
        type: Number,
        default: 0,
    },
},{
    collection: 'VLTG_ThongBaoNtd',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_ThongBaoNtd",ThongBaoNtdSchema);
