const { updateTin } = require("../../controllers/vieclamtheogio/admin");
const ViecLam = require("../../models/ViecLamTheoGio/ViecLam");
const CaLamViec = require("../../models/ViecLamTheoGio/CaLamViec");
const Users = require("../../models/ViecLamTheoGio/Users");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/ViecLam");
jest.mock("../../models/ViecLamTheoGio/CaLamViec");
jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../services/functions");

describe("updateTin", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        id_vieclam: 1,
        id_ntd: 2,
        vi_tri: "Nhân viên bán hàng",
        so_luong: 3,
        nganh_nghe: "Bán hàng",
        cap_bac: "Nhân viên",
        thoi_gian: "Full-time",
        hoa_hong: 100,
        dia_diem: "Hà Nội",
        quan_huyen: "Cầu Giấy",
        hinh_thuc: "Toàn thời gian",
        ht_luong: 1,
        tra_luong: "Theo tháng",
        luong: 8000000,
        luong_first: 0,
        luong_end: 0,
        hoc_van: "Cao đẳng",
        time_td: "2025-06-01",
        fist_time: "2025-06-02",
        last_time: "2025-06-30",
        alias: "",
        mo_ta: "Mô tả công việc",
        gender: "Không yêu cầu",
        yeu_cau: "Chăm chỉ",
        quyen_loi: "Lương thưởng hấp dẫn",
        ho_so: "CMND, Hộ khẩu",
        name_lh: "Anh A",
        phone_lh: "0901234567",
        address_lh: "Hà Nội",
        email_lh: "a@gmail.com",
        list_ca: [
          {
            day: ["2", "4", "6"],
            ca_start_time: "08:00",
            ca_end_time: "17:00",
          },
        ],
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };

    // Mock tất cả hàm phụ trợ
    functions.setError = jest.fn();
    functions.success = jest.fn();
    functions.convertTimestamp = jest.fn((x) => new Date(x).getTime());
    functions.checkDate = jest.fn().mockReturnValue(true);
    functions.checkPhoneNumber = jest.fn().mockReturnValue(true);
    functions.renderAlias = jest.fn().mockReturnValue("nhan-vien-ban-hang");
    functions.getMaxIdByField = jest.fn().mockResolvedValue(1001);
  });

  it("TC90 Cập nhật tin thành công", async () => {
    Users.findOne.mockResolvedValue({ _id: 2, type: 1 });
    ViecLam.findOneAndUpdate.mockResolvedValue({ id_vieclam: 1 });
    CaLamViec.deleteMany.mockResolvedValue({});
    CaLamViec.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));

    await updateTin(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Job updated successfully!");
  });

  it("TC91 Thiếu trường bắt buộc", async () => {
    req.body.vi_tri = "";

    await updateTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value 3", 405);
  });

  it("TC92 Không tìm thấy nhà tuyển dụng", async () => {
    Users.findOne.mockResolvedValue(null);

    await updateTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Recruiter not found", 404);
  });

  it("TC93 Ngày không hợp lệ", async () => {
    functions.checkDate.mockReturnValue(false);
    Users.findOne.mockResolvedValue({ _id: 2, type: 1 });

    await updateTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Invalid date", 406);
  });

  it("TC94 Số điện thoại không hợp lệ", async () => {
    functions.checkPhoneNumber.mockReturnValue(false);
    Users.findOne.mockResolvedValue({ _id: 2, type: 1 });

    await updateTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Invalid phone", 406);
  });

  it("TC95 Không tìm thấy việc làm để cập nhật", async () => {
    Users.findOne.mockResolvedValue({ _id: 2, type: 1 });
    ViecLam.findOneAndUpdate.mockResolvedValue(null);

    await updateTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Job not found!", 404);
  });

  it("TC96 Thiếu danh sách ca làm việc", async () => {
    req.body.list_ca = [];
    Users.findOne.mockResolvedValue({ _id: 2, type: 1 });
    ViecLam.findOneAndUpdate.mockResolvedValue({ id_vieclam: 1 });

    await updateTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input list_ca!", 400);
  });

});
