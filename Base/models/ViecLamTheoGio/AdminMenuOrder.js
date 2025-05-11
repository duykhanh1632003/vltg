const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminMenuOrderSchema = new Schema({
    amo_admin: {
        type: Number,
        required: true,
    },
    amo_module: {
        type: Number,
        required: true,
    },
    amo_order: {
        type: Number,
        default: 0,
    },
},{
    collection: 'VLTG_AdminMenuOrder',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_AdminMenuOrder",AdminMenuOrderSchema);
