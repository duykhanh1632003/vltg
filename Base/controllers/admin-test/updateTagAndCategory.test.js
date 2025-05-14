const { updateTagAndCategory } = require("../../controllers/vieclamtheogio/admin");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/JobCategory");
jest.mock("../../services/functions");

describe("updateTagAndCategory", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        jc_id: 1,
        jc_name: "Công nghệ thông tin",
        jc_description: "Ngành CNTT"
      }
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
    functions.success = jest.fn();
    functions.setError = jest.fn();
  });

  it("TC01 - Cập nhật ngành nghề thành công", async () => {
    JobCategory.findOne = jest.fn().mockResolvedValue(null); // Không trùng tên
    JobCategory.findOneAndUpdate.mockResolvedValue({
      jc_id: 1,
      jc_name: "Công nghệ thông tin",
      jc_description: "Ngành CNTT"
    });

    await updateTagAndCategory(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, "Cập nhật ngành nghề thành công.");
  });

  it("TC150 - Không nhập tên ngành nghề → báo lỗi 'Thiếu tên ngành nghề.'", async () => {
    req.body.jc_name = "";
    await updateTagAndCategory(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu tên ngành nghề.", 400);
  });

  it("TC151 - Tên ngành nghề đã tồn tại → báo lỗi 'Ngành nghề đã tồn tại.'", async () => {
    JobCategory.findOne = jest.fn().mockResolvedValue({ jc_id: 2, jc_name: "Công nghệ thông tin" }); // trùng tên

    await updateTagAndCategory(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Ngành nghề đã tồn tại.", 400);
  });

  it("TC152 - ID ngành nghề không tồn tại → báo lỗi 'Không tìm thấy ngành nghề cần cập nhật.'", async () => {
    JobCategory.findOne = jest.fn().mockResolvedValue(null); // không trùng tên
    JobCategory.findOneAndUpdate.mockResolvedValue(null); // không tìm thấy để cập nhật

    await updateTagAndCategory(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Không tìm thấy ngành nghề cần cập nhật.", 404);
  });

  it("TC153 - Thiếu trường mô tả → báo lỗi 'Thiếu thông tin cập nhật.'", async () => {
    req.body.jc_description = "";
    await updateTagAndCategory(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu thông tin cập nhật.", 400);
  });

  it("TC154 - Thiếu ID → báo lỗi 'Thiếu thông tin cập nhật.'", async () => {
    req.body.jc_id = null;
    await updateTagAndCategory(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu thông tin cập nhật.", 400);
  });
});
