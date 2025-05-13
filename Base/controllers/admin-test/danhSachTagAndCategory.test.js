const { danhSachTagAndCategory } = require("../../controllers/vieclamtheogio/admin");
const functions = require("../../services/functions");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");

jest.mock("../../services/functions");

describe("Hàm danhSachTagAndCategory", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        page: 1,
        pageSize: 10,
        type: 1,
        jc_id: 5,
        jc_name: "developer",
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };

    functions.pageFind = jest.fn();
    functions.findCount = jest.fn();
    functions.success = jest.fn();
    functions.setError = jest.fn();
  });

  it("TC102 nên trả về danh sách tag với dữ liệu hợp lệ", async () => {
    const mockData = [{ jc_id: 1, jc_name: "NodeJS" }];
    functions.pageFind.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(1);

    await danhSachTagAndCategory(req, res);

    expect(functions.pageFind).toHaveBeenCalledWith(
      JobCategory,
      { jc_parent: { $gt: 0 }, jc_id: 5, jc_name: /developer/i },
      { jc_id: -1 },
      0,
      10
    );
    expect(functions.findCount).toHaveBeenCalledWith(JobCategory, {
      jc_parent: { $gt: 0 },
      jc_id: 5,
      jc_name: /developer/i,
    });
    expect(functions.success).toHaveBeenCalledWith(res, "Lay ra tag thanh cong", {
      total: 1,
      data: mockData,
    });
  });

  it("TC103 nên gán giá trị mặc định cho page và pageSize nếu không được truyền", async () => {
    req.body = { type: 0 }; // không truyền page, pageSize
    functions.pageFind.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await danhSachTagAndCategory(req, res);

    expect(functions.pageFind).toHaveBeenCalledWith(
      JobCategory,
      { jc_parent: 0 },
      { jc_id: -1 },
      0,
      30
    );
    expect(functions.success).toHaveBeenCalledWith(res, "Lay ra tag thanh cong", {
      total: 0,
      data: [],
    });
  });

  it("TC104 nên tìm với jc_parent = 0 nếu type khác 1", async () => {
    req.body.type = 0;
    functions.pageFind.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await danhSachTagAndCategory(req, res);

    expect(functions.pageFind).toHaveBeenCalledWith(
      JobCategory,
      expect.objectContaining({ jc_parent: 0 }),
      expect.anything(),
      expect.anything(),
      expect.anything()
    );
  });

  it("TC105 nên xử lý khi xảy ra lỗi trong quá trình truy vấn", async () => {
    functions.pageFind.mockRejectedValue(new Error("Database error"));

    await danhSachTagAndCategory(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Database error");
  });
});
