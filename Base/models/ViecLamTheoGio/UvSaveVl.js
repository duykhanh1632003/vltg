const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UvSaveVlSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    id_uv: {
        type: Number,
        required: true,
    },
    id_viec: {
        type: Number,
        required: true,
    },
    ntd_name: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
},{
    collection: 'VLTG_UvSaveVl',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_UvSaveVl", UvSaveVlSchema);
