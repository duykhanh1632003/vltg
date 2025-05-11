const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobCategorySchema = new Schema({
    jc_id: {
        type: Number,
        required: true,
    },
    jc_name: {
        type: String,
        default: null 
    },
    jc_title: {
        type: String,
        default: null 
    },
    jc_description: {
        type: String,
        default: null 
    },
    jc_bv: {
        type: String,
        default: null 
    },
    jc_link: {
        type: String,
        default: null 
    },
    key_tdgy: {
        type: String,
        default: null 
    },
    key_ndgy: {
        type: String,
        default: null 
    },
    jc_keyword: {
        type: String,
        default: null 
    },
    jc_mota: {
        type: String,
        default: null 
    },
    jc_parent: {
        type: Number,
        default: 0
    },
    jc_order: {
        type: Number,
        default: 0
    },
    jc_active: {
        type: Number,
        default: 0
    },
    jc_search: {
        type: Number,
        default: 0
    },
    jc_type: {
        type: Number,
        default: 0
    },
},{
    collection: 'VLTG_JobCategories',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_JobCategories",JobCategorySchema);
