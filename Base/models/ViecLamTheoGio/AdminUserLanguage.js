const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminUserLanguageSchema = new Schema({
    //id
    aul_admin_id: {
        type: Number,
        required: true,
    },
    aul_lang_id: {
        type: Number,
        required: true,
    },
},{
    collection: 'VLTG_AdminUserLanguage',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("VLTG_AdminUserLanguage",AdminUserLanguageSchema);
