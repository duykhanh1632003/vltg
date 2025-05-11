const { danhSachUvTheoGio } = require("../controllers/vieclamtheogio/manageAccountCompany");

const Users = require("../models/ViecLamTheoGio/Users");
const NtdXemUv = require("../models/ViecLamTheoGio/NtdXemUv");
const NtdSaveUv = require("../models/ViecLamTheoGio/NtdSaveUv");
const XemUv = require("../models/ViecLamTheoGio/XemUv");
const functions = require("../services/functions");

jest.mock("../models/ViecLamTheoGio/Users");
jest.mock("../models/ViecLamTheoGio/NtdXemUv");
jest.mock("../models/ViecLamTheoGio/NtdSaveUv");
jest.mock("../models/ViecLamTheoGio/XemUv");
jest.mock("../services/functions");

describe("danhSachUvTheoGio", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        page: 1,
        pageSize: 2,
        id_nganh: "cntt",
        id_city: 1,
      },
      user: {
        data: {
          _id: 999,
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    functions.success.mockClear();
    functions.setError.mockClear();
  });

  test("DSUVTG_TC01 - Lấy danh sách ứng viên thành công", async () => {
    Users.aggregate
      .mockResolvedValueOnce([
        {
          _id: 1,
          userName: "User 1",
          city: 1,
          CVMM: { cong_viec: "Dev" },
        },
        {
          _id: 2,
          userName: "User 2",
          city: 1,
          CVMM: { cong_viec: "Tester" },
        },
      ])
      .mockResolvedValueOnce([{ count: 2 }]);

    NtdXemUv.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({}); // 2 users
    NtdSaveUv.findOne.mockResolvedValueOnce({}).mockResolvedValueOnce(null);
    XemUv.findOne.mockResolvedValueOnce({}).mockResolvedValueOnce(null);

    await danhSachUvTheoGio(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Lay ra danh sach thanh cong", {
      total: 2,
      data: expect.any(Array),
    });
  });

  test("DSUVTG_TC02 - Không truyền page và pageSize (sử dụng mặc định)", async () => {
    req.body = { id_nganh: "cntt", id_city: 1 };

    Users.aggregate
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ count: 0 }]);

    await danhSachUvTheoGio(req, res);

    expect(functions.success).toHaveBeenCalled();
  });

  test("DSUVTG_TC03 - Không truyền id_nganh, id_city (lọc điều kiện đơn giản)", async () => {
    req.body = { page: 1, pageSize: 5 };

    Users.aggregate
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ count: 0 }]);

    await danhSachUvTheoGio(req, res);

    expect(functions.success).toHaveBeenCalled();
  });

  test("DSUVTG_TC04 - Không có ứng viên nào trả về", async () => {
    Users.aggregate
      .mockResolvedValueOnce([]) // danh sách
      .mockResolvedValueOnce([]); // tổng

    await danhSachUvTheoGio(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Lay ra danh sach thanh cong", {
      total: 0,
      data: [],
    });
  });

  test("DSUVTG_TC05 - Một trong các lệnh kiểm tra đã xem/lưu bị lỗi", async () => {
    Users.aggregate
      .mockResolvedValueOnce([{ _id: 1, CVMM: {} }])
      .mockResolvedValueOnce([{ count: 1 }]);

    NtdXemUv.findOne.mockRejectedValue(new Error("Lỗi khi tìm NtdXemUv"));
    NtdSaveUv.findOne.mockResolvedValue(null);
    XemUv.findOne.mockResolvedValue(null);

    await danhSachUvTheoGio(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Lỗi khi tìm NtdXemUv");
  });

  test("DSUVTG_TC06 - Lỗi xảy ra khi query danh sách ứng viên", async () => {
    Users.aggregate.mockRejectedValue(new Error("DB error"));

    await danhSachUvTheoGio(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "DB error");
  });

  test("DSUVTG_TC07 - Không có user đăng nhập (id_ntd = null)", async () => {
    req.user = null;

    Users.aggregate
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ count: 0 }]);

    await danhSachUvTheoGio(req, res);

    expect(functions.success).toHaveBeenCalled();
  });

  test("DSUVTG_TC08 - total = 0 trả về từ aggregate count", async () => {
    Users.aggregate
      .mockResolvedValueOnce([{ _id: 1, CVMM: {} }])
      .mockResolvedValueOnce([]); // không có count

    NtdXemUv.findOne.mockResolvedValue(null);
    NtdSaveUv.findOne.mockResolvedValue(null);
    XemUv.findOne.mockResolvedValue(null);

    await danhSachUvTheoGio(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Lay ra danh sach thanh cong", {
      total: 0,
      data: expect.any(Array),
    });
  });
});
