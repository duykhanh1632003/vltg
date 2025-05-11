const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminCommentSchema = new Schema({
    admc_id: {
        type: Number,
        required: true,
    },
    admc_comment: {
        type: String,
        default: null,
    },
    admc_date: {
        type: Number,
        default: 0,
    },
    admin_id: {
        type: Number,
        default: 0,
    },
    admc_keyword: {
        type: Number,
        default: 0,
    },
},{
    collection: 'VLTG_AdminComment',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_AdminComment",AdminCommentSchema);
