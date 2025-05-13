const { thongKeViecLam } = require("../vieclamtheogio/viecLam");

const ViecLam = require("../../models/ViecLamTheoGio/ViecLam");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");
const City2 = require("../../models/ViecLamTheoGio/City2");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/ViecLam");
jest.mock("../../models/ViecLamTheoGio/JobCategory");
jest.mock("../../models/ViecLamTheoGio/City2");
jest.mock("../../services/functions");

describe("Unit test: thongKeViecLam", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {};
    jest.clearAllMocks();
  });

  it("✅ Trả về thống kê chính xác với dữ liệu giả lập", async () => {
    const mockJobs = [
      { hinh_thuc: 1, nganh_nghe: "1, 2", dia_diem: 1 },
      { hinh_thuc: 2, nganh_nghe: "2, 3", dia_diem: 2 },
      { hinh_thuc: 3, nganh_nghe: "1, 3", dia_diem: 1 },
    ];

    const mockJobCategories = [
      { jc_id: 1, jc_name: "CNTT" },
      { jc_id: 2, jc_name: "Kế toán" },
      { jc_id: 3, jc_name: "Marketing" },
    ];

    const mockCities = [
      { cit_id: 1, cit_name: "Hà Nội" },
      { cit_id: 2, cit_name: "HCM" },
    ];

    ViecLam.find.mockResolvedValue(mockJobs);
    JobCategory.find.mockResolvedValue(mockJobCategories);
    City2.find.mockResolvedValue(mockCities);
    functions.convertTimestamp.mockReturnValue(Date.now() / 1000);
    functions.success.mockImplementation((res, msg, data) => data);

    await thongKeViecLam(req, res);

    expect(ViecLam.find).toHaveBeenCalledWith({ active: 1 });
    expect(JobCategory.find).toHaveBeenCalled();
    expect(City2.find).toHaveBeenCalledWith(
      { cit_parent: 0 },
      { cit_id: 1, cit_name: 1 }
    );
    expect(functions.success).toHaveBeenCalledWith(
      res,
      expect.any(String),
      expect.objectContaining({
        totalHinhThuc: [1, 1, 1],
        totaNganhNghe: expect.any(Array),
        totaTinhThanh: expect.any(Array),
      })
    );
  });

  it("✅ Trả về rỗng khi không có dữ liệu việc làm", async () => {
    ViecLam.find.mockResolvedValue([]);
    JobCategory.find.mockResolvedValue([]);
    City2.find.mockResolvedValue([]);
    functions.convertTimestamp.mockReturnValue(Date.now() / 1000);
    functions.success.mockImplementation((res, msg, data) => data);

    await thongKeViecLam(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      expect.any(String),
      {
        totalHinhThuc: [0, 0, 0],
        totaNganhNghe: [],
        totaTinhThanh: [],
      }
    );
  });

  it("❌ Ném lỗi khi ViecLam.find bị lỗi", async () => {
    ViecLam.find.mockImplementation(() => {
      throw new Error("Lỗi ViecLam");
    });

    await thongKeViecLam(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Lỗi ViecLam");
  });

  it("❌ Ném lỗi khi JobCategory.find bị lỗi", async () => {
    ViecLam.find.mockResolvedValue([]);
    JobCategory.find.mockImplementation(() => {
      throw new Error("Lỗi JobCategory");
    });

    await thongKeViecLam(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Lỗi JobCategory");
  });

  it("❌ Ném lỗi khi City2.find bị lỗi", async () => {
    ViecLam.find.mockResolvedValue([]);
    JobCategory.find.mockResolvedValue([]);
    City2.find.mockImplementation(() => {
      throw new Error("Lỗi City2");
    });

    await thongKeViecLam(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Lỗi City2");
  });
});
