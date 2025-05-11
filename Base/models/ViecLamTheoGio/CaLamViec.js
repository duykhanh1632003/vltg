const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CaLamViecSchema = new Schema({
    ca_id: {
        type: Number,
        required: true,
    },
    ca_id_viec: {
        type: Number,
        required: true,
    },
    ca_start_time: {
        type: String,
        required: true,
    },
    ca_end_time: {
        type: String,
        required: true, 
    },
    day: {
        type: String,
        required: true,
    },
},{
    collection: 'VLTG_CaLamViec',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_CaLamViec",CaLamViecSchema);
