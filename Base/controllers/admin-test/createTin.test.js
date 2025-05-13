const { createTin } = require("../../controllers/vieclamtheogio/admin");
const ViecLam = require("../../models/ViecLamTheoGio/ViecLam");
const CaLamViec = require("../../models/ViecLamTheoGio/CaLamViec");
const Users = require("../../models/ViecLamTheoGio/Users");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/ViecLam");
jest.mock("../../models/ViecLamTheoGio/CaLamViec");
jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../services/functions");

describe("createTin", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        id_ntd: 1,
        vi_tri: "Nhân viên bán hàng",
        so_luong: 5,
        nganh_nghe: "Bán lẻ",
        cap_bac: "Nhân viên",
        thoi_gian: "Full-time",
        hoa_hong: 0,
        dia_diem: "Hà Nội",
        quan_huyen: "Ba Đình",
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
        mo_ta: "Công việc đơn giản",
        gender: "Không yêu cầu",
        yeu_cau: "Chăm chỉ",
        quyen_loi: "Thưởng lễ tết",
        ho_so: "Sơ yếu lý lịch",
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

    functions.setError = jest.fn();
    functions.success = jest.fn();
    functions.checkDate = jest.fn().mockReturnValue(true);
    functions.checkPhoneNumber = jest.fn().mockReturnValue(true);
    functions.renderAlias = jest.fn().mockReturnValue("nhan-vien-ban-hang");
    functions.convertTimestamp = jest.fn().mockImplementation((x) => new Date(x).getTime());
    functions.getMaxIdByField = jest.fn().mockResolvedValue(1001);
  });

  it("✅ Tạo tin thành công", async () => {
    Users.findOne.mockResolvedValue({ _id: 1, type: 1 });
    ViecLam.findOne.mockResolvedValue(null);
    ViecLam.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));
    CaLamViec.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));

    await createTin(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Posted successfully!");
  });

  it("TC83 Thiếu list_ca", async () => {
    req.body.list_ca = [];
    Users.findOne.mockResolvedValue({ _id: 1, type: 1 });
    ViecLam.findOne.mockResolvedValue(null);

    await createTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input list_ca", 407);
  });

  it("TC84 Thiếu trường bắt buộc", async () => {
    req.body.vi_tri = "";
    await createTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value 1", 405);
  });

  it("TC85 Không tìm thấy NTD", async () => {
    Users.findOne.mockResolvedValue(null);
    await createTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Recruitment not found!", 404);
  });

  it("TC86 Tiêu đề bị trùng", async () => {
    Users.findOne.mockResolvedValue({ _id: 1, type: 1 });
    ViecLam.findOne.mockResolvedValue({ vi_tri: "Nhân viên bán hàng" });

    await createTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Title is duplicated!", 400);
  });

  it("TC87 Ngày không hợp lệ", async () => {
    functions.checkDate = jest.fn().mockReturnValue(false);
    Users.findOne.mockResolvedValue({ _id: 1, type: 1 });
    ViecLam.findOne.mockResolvedValue(null);

    await createTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Invalid date", 406);
  });

  it("TC88 Số điện thoại không hợp lệ", async () => {
    functions.checkPhoneNumber = jest.fn().mockReturnValue(false);
    Users.findOne.mockResolvedValue({ _id: 1, type: 1 });
    ViecLam.findOne.mockResolvedValue(null);

    await createTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Invalid phone", 406);
  });

});
