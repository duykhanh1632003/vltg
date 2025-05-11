const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminTranslateSchema = new Schema({
    //id
    tra_keyword: {
        type: String,
        required: true,
    },
    tra_text: {
        type: String,
        default: null,
    },
    lang_id: {
        type: Number,
        default: 0,
    },
    tra_source: {
        type: String,
        default: null,
    },
},{
    collection: 'VLTG_AdminTranslate',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_AdminTranslate",AdminTranslateSchema);
