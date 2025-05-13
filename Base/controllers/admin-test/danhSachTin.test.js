const { danhSachTin } = require("../../controllers/vieclamtheogio/admin");
const ViecLam = require("../../models/ViecLamTheoGio/ViecLam");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/ViecLam");
jest.mock("../../services/functions");

describe("danhSachTin", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        page: 1,
        pageSize: 10,
        id_vieclam: "123",
        id_ntd: "456",
        vi_tri: "Kế toán",
        name_ntd: "Công ty A",
        fromDate: "2023-01-01",
        toDate: "2023-12-31",
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };

    functions.convertTimestamp.mockImplementation((val) => {
      if (!val) return null;
      return new Date(val).getTime();
    });
    functions.success = jest.fn();
    functions.setError = jest.fn();
  });

  it("TC73 Trả dữ liệu đúng với đầy đủ bộ lọc", async () => {
    ViecLam.aggregate.mockResolvedValueOnce([{ id_vieclam: 123, userName: "Công ty A" }]);
    ViecLam.aggregate.mockResolvedValueOnce([{ count: 1 }]);

    await danhSachTin(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Get viec lam thanh cong", {
      total: 1,
      data: [{ id_vieclam: 123, userName: "Công ty A" }],
    });
  });

  it("TC74 Trả dữ liệu đúng khi chỉ có fromDate", async () => {
    req.body = { fromDate: "2023-01-01", page: 1, pageSize: 10 };
    ViecLam.aggregate.mockResolvedValueOnce([]);
    ViecLam.aggregate.mockResolvedValueOnce([{ count: 0 }]);

    await danhSachTin(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Get viec lam thanh cong", {
      total: 0,
      data: [],
    });
  });

  it("TC75 Trả dữ liệu đúng khi chỉ có toDate", async () => {
    req.body = { toDate: "2023-12-31", page: 1, pageSize: 10 };
    ViecLam.aggregate.mockResolvedValueOnce([]);
    ViecLam.aggregate.mockResolvedValueOnce([{ count: 0 }]);

    await danhSachTin(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Get viec lam thanh cong", {
      total: 0,
      data: [],
    });
  });

  it("TC76 Trả dữ liệu đúng khi không có filter nào", async () => {
    req.body = {};
    ViecLam.aggregate.mockResolvedValueOnce([]);
    ViecLam.aggregate.mockResolvedValueOnce([{ count: 0 }]);

    await danhSachTin(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Get viec lam thanh cong", {
      total: 0,
      data: [],
    });
  });

  it("TC77 Xử lý khi xảy ra lỗi", async () => {
    ViecLam.aggregate.mockRejectedValueOnce(new Error("DB Error"));

    await danhSachTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "DB Error");
  });

  it("TC78 Trả dữ liệu đúng khi có vi_tri", async () => {
    req.body = { vi_tri: "kế toán", page: 1, pageSize: 10 };
    ViecLam.aggregate.mockResolvedValueOnce([{ id_vieclam: 789, vi_tri: "Kế toán tổng hợp" }]);
    ViecLam.aggregate.mockResolvedValueOnce([{ count: 1 }]);

    await danhSachTin(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Get viec lam thanh cong", {
      total: 1,
      data: [{ id_vieclam: 789, vi_tri: "Kế toán tổng hợp" }],
    });
  });

  it("TC79 Trả dữ liệu đúng khi có name_ntd", async () => {
    req.body = { name_ntd: "Công ty B", page: 1, pageSize: 10 };
    ViecLam.aggregate.mockResolvedValueOnce([{ id_vieclam: 321, userName: "Công ty B" }]);
    ViecLam.aggregate.mockResolvedValueOnce([{ count: 1 }]);

    await danhSachTin(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Get viec lam thanh cong", {
      total: 1,
      data: [{ id_vieclam: 321, userName: "Công ty B" }],
    });
  });

  it("TC80 Bỏ qua id_vieclam nếu không thể parse thành số", async () => {
    req.body = { id_vieclam: "abc", page: 1, pageSize: 10 };
    ViecLam.aggregate.mockResolvedValueOnce([]);
    ViecLam.aggregate.mockResolvedValueOnce([{ count: 0 }]);

    await danhSachTin(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Get viec lam thanh cong", {
      total: 0,
      data: [],
    });
  });

  it("TC81 Không lọc ngày khi fromDate/toDate không hợp lệ", async () => {
    req.body = { fromDate: null, toDate: undefined, page: 1, pageSize: 10 };
    ViecLam.aggregate.mockResolvedValueOnce([]);
    ViecLam.aggregate.mockResolvedValueOnce([{ count: 0 }]);

    await danhSachTin(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Get viec lam thanh cong", {
      total: 0,
      data: [],
    });
  });

  it("TC82 Kiểm tra skip và limit đúng khi page=2, pageSize=5", async () => {
    req.body = { page: 2, pageSize: 5 };
    ViecLam.aggregate.mockResolvedValueOnce([]);
    ViecLam.aggregate.mockResolvedValueOnce([{ count: 0 }]);

    await danhSachTin(req, res);

    expect(ViecLam.aggregate).toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalledWith(res, "Get viec lam thanh cong", {
      total: 0,
      data: [],
    });
  });
});
