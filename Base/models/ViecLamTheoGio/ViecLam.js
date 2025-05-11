const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ViecLamSchema = new Schema(
  {
    id_vieclam: {
      type: Number,
      required: true,
    },
    id_ntd: {
      type: Number,
      required: true,
    },
    hoc_van: {
      type: Number,
      default: 0,
    },
    tra_luong: {
      type: Number,
      default: 0,
    },
    dia_diem: {
      type: Number,
      default: null,
    },
    quan_huyen: {
      type: Number,
      default: null,
    },
    thoi_gian: {
      type: String,
      default: null,
    },
    vi_tri: {
      type: String,
      default: null,
    },
    alias: {
      type: String,
      default: null,
    },
    hinh_thuc: {
      type: Number,
      default: 0,
    },
    muc_luong: {
      type: String,
      default: null,
    },
    luong: {
      type: Number,
      default: 0,
    },
    luong_first: {
      type: Number,
      default: 0,
    },
    luong_last: {
      type: Number,
      default: 0,
    },
    ht_luong: {
      type: Number,
      default: 0,
    },
    hoa_hong: {
      type: String,
      default: null,
    },
    so_luong: {
      type: Number,
      default: 0,
    },
    nganh_nghe: {
      type: String,
      default: null,
    },
    cap_bac: {
      type: Number,
      default: 0,
    },
    time_td: {
      type: Number,
      default: 0,
    },
    fist_time: {
      type: Date,
      default: null,
    },
    last_time: {
      type: Date,
      default: null,
    },
    mo_ta: {
      type: String,
      default: null,
    },
    gender: {
      type: Number,
      default: 0,
    },
    yeu_cau: {
      type: String,
      default: null,
    },
    quyen_loi: {
      type: String,
      default: null,
    },
    ho_so: {
      type: String,
      default: null,
    },
    luot_xem: {
      type: Number,
      default: 0,
    },
    name_lh: {
      type: String,
      default: null,
    },
    phone_lh: {
      type: String,
      default: null,
    },
    address_lh: {
      type: String,
      default: null,
    },
    email_lh: {
      type: String,
      default: null,
    },
    vl_created_time: {
      type: Number,
      default: 0,
    },
    active: {
      type: Number,
      default: 1,
    },
    created_at: {
      type: Number,
      default: 0,
    },
    vl_index: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      default: null,
    },
  },
  {
    collection: "VLTG_ViecLam",
    versionKey: false,
    timestamp: true,
  }
);

module.exports = mongoose.model("VLTG_ViecLam", ViecLamSchema);
