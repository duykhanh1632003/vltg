const { thongKeDanhSachViecLam } = require("../vieclamtheogio/viecLam");

const ViecLam = require("../../models/ViecLamTheoGio/ViecLam");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");
const City2 = require("../../models/ViecLamTheoGio/City2");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/ViecLam");
jest.mock("../../models/ViecLamTheoGio/JobCategory");
jest.mock("../../models/ViecLamTheoGio/City2");
jest.mock("../../services/functions");

describe("Unit test: thongKeDanhSachViecLam", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {};
    jest.clearAllMocks();
  });

  it("✅ Trả về danh sách việc làm với đầu vào rỗng", async () => {
    ViecLam.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await thongKeDanhSachViecLam(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      expect.any(String),
      expect.objectContaining({
        total: 0,
        listBlog: [],
        data: [],
      })
    );
  });

  it("✅ Trả về đúng khi truyền key", async () => {
    req.body.key = "lập trình viên";

    ViecLam.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await thongKeDanhSachViecLam(req, res);

    expect(functions.success).toHaveBeenCalled();
  });

  it("✅ Trả về đúng khi truyền id_nganh", async () => {
    req.body.id_nganh = 123;

    JobCategory.findOne.mockResolvedValue({ jc_id: 123 });
    ViecLam.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await thongKeDanhSachViecLam(req, res);

    expect(JobCategory.findOne).toHaveBeenCalledWith({ jc_id: 123 });
    expect(functions.success).toHaveBeenCalled();
  });

  it("✅ Trả về đúng khi truyền id_city và district", async () => {
    req.body.id_city = 1;
    req.body.district = 101;

    City2.findOne.mockResolvedValue({ cit_id: 1 });
    ViecLam.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await thongKeDanhSachViecLam(req, res);

    expect(City2.findOne).toHaveBeenCalledTimes(2);
    expect(functions.success).toHaveBeenCalled();
  });

  it("✅ Trả về đúng khi truyền tag", async () => {
    req.body.tag = 200;

    JobCategory.findOne.mockResolvedValue({ jc_id: 200 });
    ViecLam.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await thongKeDanhSachViecLam(req, res);

    expect(JobCategory.findOne).toHaveBeenCalledWith({ jc_id: 200 });
    expect(functions.success).toHaveBeenCalled();
  });

  it("✅ Trả về đúng khi truyền full filter", async () => {
    req.body = {
      page: 2,
      pageSize: 5,
      key: "data",
      id_nganh: 123,
      id_city: 1,
      district: 2,
      tag: 123,
    };

    JobCategory.findOne.mockResolvedValue({ jc_id: 123 });
    City2.findOne.mockResolvedValue({ cit_id: 1 });
    ViecLam.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await thongKeDanhSachViecLam(req, res);

    expect(JobCategory.findOne).toHaveBeenCalledTimes(2);
    expect(City2.findOne).toHaveBeenCalledTimes(2);
    expect(functions.success).toHaveBeenCalled();
  });

  it("❌ Trường hợp key không tìm thấy dữ liệu", async () => {
    req.body.key = "khongcodulieu";
    ViecLam.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await thongKeDanhSachViecLam(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      expect.any(String),
      expect.objectContaining({ data: [] })
    );
  });

  it("❌ Ném lỗi khi JobCategory.findOne bị lỗi", async () => {
    req.body.id_nganh = 123;
    JobCategory.findOne.mockImplementation(() => {
      throw new Error("JobCategory error");
    });

    await thongKeDanhSachViecLam(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "JobCategory error");
  });

  it("❌ Ném lỗi khi ViecLam.aggregate bị lỗi", async () => {
    ViecLam.aggregate.mockImplementation(() => {
      throw new Error("Aggregate error");
    });

    await thongKeDanhSachViecLam(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Aggregate error");
  });
});
