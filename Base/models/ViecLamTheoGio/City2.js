const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const City2Schema = new Schema({
    cit_id: {
        type: Number,
        required: true,
    },
    cit_name: {
        type: String,
        default: null 
    },
    cit_order: {
        type: Number,
        default: 0 
    },
    cit_type: {
        type: Number,
        default: 0 
    },
    cit_count: {
        type: Number,
        default: 0 
    },
    cit_parent: {
        type: Number,
        default: 0 
    },
    cit_bv: {
        type: String,
        default: null 
    },
    cit_ndgy: {
        type: String,
        default: null 
    },
    cit_tdgy: {
        type: String,
        default: null 
    },
    cit_time: {
        type: Number,
        default: 0
    },
    cit_tag: {
        type: Number,
        default: 0
    },
},{
    collection: 'VLTG_City2',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_City2",City2Schema);
