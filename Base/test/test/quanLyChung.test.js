const { quanLyChung } = require("../controllers/vieclamtheogio/manageAccountCompany");
const functions = require("../services/functions");

const ViecLam = require("../models/ViecLamTheoGio/ViecLam");
const UngTuyen = require("../models/ViecLamTheoGio/UngTuyen");
const Users = require("../models/ViecLamTheoGio/Users");
const NtdXemUv = require("../models/ViecLamTheoGio/NtdXemUv");

jest.mock("../services/functions");
jest.mock("../models/ViecLamTheoGio/ViecLam");
jest.mock("../models/ViecLamTheoGio/UngTuyen");
jest.mock("../models/ViecLamTheoGio/Users");
jest.mock("../models/ViecLamTheoGio/NtdXemUv");

describe("quanLyChung", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        page: 1,
        pageSize: 2,
      },
      user: {
        data: {
          _id: 999,
          type: 1,
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("QLC_TC01 - type !== 1 (không phải công ty)", async () => {
    req.user.data.type = 0;

    await quanLyChung(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Not company", 403);
  });

  test("QLC_TC02 - type === 1, page & pageSize không truyền", async () => {
    req.body = {};

    ViecLam.find.mockResolvedValue([]);
    UngTuyen.aggregate.mockResolvedValue([]);
    functions.convertTimestamp.mockReturnValue(Math.floor(Date.now() / 1000));
    functions.findCount.mockResolvedValue(5);
    Users.findOne.mockResolvedValue({ diem_free: 10 });
    UngTuyen.distinct.mockResolvedValue([]);
    NtdXemUv.countDocuments = jest.fn().mockResolvedValue(2);
    functions.findCount.mockResolvedValue(2);

    await quanLyChung(req, res);

    expect(functions.success).toHaveBeenCalled();
  });

  test("QLC_TC03 - ViecLam có dữ liệu, phân loại count đúng", async () => {
    const currentTime = Math.floor(Date.now() / 1000);

    functions.convertTimestamp
      .mockReturnValueOnce(currentTime) // time
      .mockReturnValueOnce(currentTime - 86400); // today

    functions.findCount.mockResolvedValue(3);
    ViecLam.find
      .mockResolvedValueOnce([
        {
          id_vieclam: 1,
          vl_created_time: currentTime - 1000,
          time_td: currentTime,
          last_time: new Date(currentTime * 1000 - 86400),
        },
      ]) // viecLamMoiNhat
      .mockResolvedValueOnce([
        {
          id_vieclam: 1,
          vl_created_time: currentTime - 1000,
          time_td: currentTime,
          last_time: new Date(currentTime * 1000 - 86400),
        },
      ]); // viecLam

    UngTuyen.distinct.mockResolvedValue([1]);
    UngTuyen.aggregate.mockResolvedValue([]);
    Users.findOne.mockResolvedValue({ diem_free: 20 });
    functions.findCount.mockResolvedValue(1);

    await quanLyChung(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      "Danh sach tin tuyen dung moi nhat",
      expect.objectContaining({
        info: expect.objectContaining({
          totalHoSoUngTuyen: 1,
          totalLocDiem: 1,
          diemDocFree: 20,
        }),
      })
    );
  });

  test("QLC_TC04 - Không tìm thấy ViecLam, UngTuyen, Users", async () => {
    functions.convertTimestamp.mockReturnValue(Math.floor(Date.now() / 1000));
    functions.findCount.mockResolvedValue(0);
    ViecLam.find.mockResolvedValue([]);
    UngTuyen.distinct.mockResolvedValue([]);
    UngTuyen.aggregate.mockResolvedValue([]);
    Users.findOne.mockResolvedValue(null);
    functions.findCount.mockResolvedValue(0);

    await quanLyChung(req, res);

    expect(functions.success).toHaveBeenCalled();
  });

  test("QLC_TC05 - Xử lý lỗi (try-catch)", async () => {
    const error = new Error("DB failed");
    ViecLam.find.mockRejectedValue(error);

    await quanLyChung(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, error.message);
  });
});
