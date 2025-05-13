const { updateTagAndCategory } = require("../../controllers/vieclamtheogio/admin");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/JobCategory");
jest.mock("../../services/functions");

describe("Hàm updateTagAndCategory", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        jc_id: 5,
        jc_name: "Marketing",
        jc_description: "Ngành tiếp thị",
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };

    functions.success = jest.fn();
    functions.setError = jest.fn();
  });

  it("TC111 nên cập nhật tag thành công khi dữ liệu hợp lệ", async () => {
    JobCategory.findOneAndUpdate.mockResolvedValue({
      jc_id: 5,
      jc_name: "Marketing",
      jc_description: "Ngành tiếp thị",
    });

    await updateTagAndCategory(req, res);

    expect(JobCategory.findOneAndUpdate).toHaveBeenCalledWith(
      { jc_id: 5 },
      {
        jc_name: "Marketing",
        jc_description: "Ngành tiếp thị",
      },
      { new: true }
    );
    expect(functions.success).toHaveBeenCalledWith(res, "Update tag success");
  });

  it("TC112 nên trả lỗi nếu thiếu jc_id", async () => {
    delete req.body.jc_id;

    await updateTagAndCategory(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value", 400);
  });

  it("TC113 nên trả lỗi nếu thiếu jc_name", async () => {
    delete req.body.jc_name;

    await updateTagAndCategory(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value", 400);
  });

  it("TC114 nên trả lỗi nếu thiếu jc_description", async () => {
    delete req.body.jc_description;

    await updateTagAndCategory(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value", 400);
  });

  it("TC115 nên trả lỗi nếu không tìm thấy tag để cập nhật", async () => {
    JobCategory.findOneAndUpdate.mockResolvedValue(null);

    await updateTagAndCategory(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Update tag fail", 405);
  });
});
