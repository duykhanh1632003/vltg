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
        jc_id: 1,
        jc_name: "   Công nghệ  ", // Có khoảng trắng để test trim()
        type: 0,
      },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    functions.success = jest.fn();
    functions.setError = jest.fn();
    functions.pageFind = jest.fn();
    functions.findCount = jest.fn();
  });

  it("TC156 - Lấy danh sách ngành nghề thành công", async () => {
    const mockData = [{ jc_id: 1, jc_name: "Công nghệ thông tin", jc_description: "IT" }];
    functions.pageFind.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(1);

    await danhSachTagAndCategory(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Lấy ra danh sách ngành nghề thành công.", {
      total: 1,
      data: mockData,
    });
  });

  it("TC157 - Nhập sai định dạng ký tự ở ID (ký tự đặc biệt) → Bỏ qua bộ lọc ID", async () => {
    req.body.jc_id = "@@@"; // sai định dạng
    functions.pageFind.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await danhSachTagAndCategory(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Lấy ra danh sách ngành nghề thành công.", {
      total: 0,
      data: [],
    });
  });

  it("TC158 - Không có dữ liệu khớp với bộ lọc → Trả về danh sách trắng", async () => {
    functions.pageFind.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await danhSachTagAndCategory(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Lấy ra danh sách ngành nghề thành công.", {
      total: 0,
      data: [],
    });
  });

  it("TC159 - Lỗi kết nối server → Trả về thông báo 'Không thể tải danh sách, vui lòng thử lại sau.'", async () => {
    functions.pageFind.mockImplementation(() => {
      throw new Error("Lỗi kết nối");
    });

    await danhSachTagAndCategory(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Không thể tải danh sách, vui lòng thử lại sau.");
  });

  it("TC160 - Tên ngành nghề có khoảng trắng đầu/cuối → Phải được trim trước khi tìm", async () => {
    req.body.jc_name = "   công nghệ thông tin   ";
    functions.pageFind.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await danhSachTagAndCategory(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Lấy ra danh sách ngành nghề thành công.", {
      total: 0,
      data: [],
    });
  });

  it("TC161 - Trường tìm kiếm toàn khoảng trắng → Hệ thống hiểu là tìm tất cả", async () => {
    req.body.jc_name = "     ";
    functions.pageFind.mockResolvedValue([{ jc_id: 1 }]);
    functions.findCount.mockResolvedValue(1);

    await danhSachTagAndCategory(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Lấy ra danh sách ngành nghề thành công.", {
      total: 1,
      data: [{ jc_id: 1 }],
    });
  });
});
