const { tuKhoaLienQuan } = require("../vieclamtheogio/viecLam");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/JobCategory");
jest.mock("../../services/functions");

describe("Unit test: tuKhoaLienQuan", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {};
    jest.clearAllMocks();
  });

  it("✅ Trả về danh sách ngành nghề đúng định dạng và đúng thứ tự", async () => {
    const mockData = [
      { jc_id: 1, jc_name: "IT" },
      { jc_id: 2, jc_name: "Marketing" },
    ];

    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockData),
      }),
    });

    await tuKhoaLienQuan(req, res);

    expect(JobCategory.find).toHaveBeenCalledWith(
      { jc_parent: { $gt: 0 } },
      { jc_id: 1, jc_name: 1 }
    );

    expect(functions.success).toHaveBeenCalledWith(
      res,
      "Lay ra danh sach cong viec lien quan thanh cong",
      { data: mockData }
    );
  });

  it("✅ Trả về mảng rỗng nếu không có dữ liệu", async () => {
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    });

    await tuKhoaLienQuan(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      "Lay ra danh sach cong viec lien quan thanh cong",
      { data: [] }
    );
  });

  it("❌ Trả về lỗi khi JobCategory.find ném lỗi", async () => {
    const mockError = new Error("Database error");

    JobCategory.find.mockImplementation(() => {
      throw mockError;
    });

    await tuKhoaLienQuan(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Database error");
  });
});
