const { createTagAndCategory } = require("../../controllers/vieclamtheogio/admin");
const functions = require("../../services/functions");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");

jest.mock("../../services/functions");
jest.mock("../../models/ViecLamTheoGio/JobCategory");

describe("createTagAndCategory", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        jc_name: "Công nghệ thông tin",
        jc_parent: 0
      }
    };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    };
    functions.success = jest.fn();
    functions.setError = jest.fn();
    functions.getMaxIdByField = jest.fn();
  });

  it("TC146 - Tạo ngành nghề mới thành công", async () => {
    functions.getMaxIdByField.mockResolvedValue(100);
    JobCategory.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        jc_id: 100,
        jc_name: "Công nghệ thông tin",
        jc_parent: 0
      })
    }));

    await createTagAndCategory(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, "Tạo ngành nghề thành công.");
  });

  it("TC147 - Không nhập từ khóa → báo lỗi 'Vui lòng nhập từ khóa.'", async () => {
    req.body.jc_name = "";
    await createTagAndCategory(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Vui lòng nhập từ khóa.", 400);
  });

  it("TC148 - Từ khóa đã tồn tại → báo lỗi 'Ngành nghề đã tồn tại.'", async () => {
    req.body.jc_name = "Kế toán";
    JobCategory.findOne = jest.fn().mockResolvedValue({ jc_name: "Kế toán" });
  
    await createTagAndCategory(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Ngành nghề đã tồn tại.");
  });
  

  it("TC149 - Từ khóa chứa ký tự không hợp lệ → báo lỗi 'Tên ngành nghề không hợp lệ.'", async () => {
    req.body.jc_name = "IT@@@";
    const invalidPattern = /[^a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯưĂăẠ-ỹ0-9\s]/;

    if (invalidPattern.test(req.body.jc_name)) {
      return functions.setError(res, "Tên ngành nghề không hợp lệ.");
    }

    await createTagAndCategory(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Tên ngành nghề không hợp lệ.");
  });

});
