const { createTagAndCategory } = require("../../controllers/vieclamtheogio/admin");
const functions = require("../../services/functions");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");

jest.mock("../../services/functions");
jest.mock("../../models/ViecLamTheoGio/JobCategory");

describe("Hàm createTagAndCategory", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        jc_parent: 0,
        jc_name: "Lập trình",
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };

    functions.success = jest.fn();
    functions.setError = jest.fn();
    functions.getMaxIdByField.mockResolvedValue(10);

    JobCategory.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        jc_id: 10,
        jc_parent: 0,
        jc_name: "Lập trình",
      }),
    }));
  });

  it("TC106 nên tạo tag thành công khi dữ liệu hợp lệ", async () => {
    await createTagAndCategory(req, res);

    expect(functions.getMaxIdByField).toHaveBeenCalledWith(JobCategory, "jc_id");
    expect(functions.success).toHaveBeenCalledWith(res, "Create tag success");
  });

  it("TC107 nên gán jc_parent = 0 nếu không truyền", async () => {
    delete req.body.jc_parent;

    await createTagAndCategory(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Create tag success");
  });

  it("TC108 nên trả lỗi nếu không truyền jc_name", async () => {
    req.body.jc_name = "";

    await createTagAndCategory(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value", 400);
  });

  it("TC109 nên trả lỗi nếu không lưu được tag", async () => {
    JobCategory.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(null),
    }));

    await createTagAndCategory(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Create tag fail", 405);
  });

  it("TC110 nên xử lý lỗi khi xảy ra exception", async () => {
    functions.getMaxIdByField.mockRejectedValue(new Error("Lỗi hệ thống"));

    await createTagAndCategory(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Lỗi hệ thống");
  });
});
