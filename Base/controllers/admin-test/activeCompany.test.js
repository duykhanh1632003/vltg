const { activeCompany } = require("../../controllers/vieclamtheogio/admin");
const Users = require("../../models/ViecLamTheoGio/Users");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../services/functions");

describe("activeCompany", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        id_ntd: "101",
        active: 1
      }
    };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };
    functions.success = jest.fn();
    functions.setError = jest.fn();
  });

  it("TC142 - Kích hoạt thành công khi dữ liệu hợp lệ", async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: 101 });
    await activeCompany(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, "Kích hoạt tài khoản nhà tuyển dụng thành công!");
  });

  it("TC143 - Hủy kích hoạt thành công khi active = 0", async () => {
    req.body.active = 0;
    Users.findOneAndUpdate.mockResolvedValue({ _id: 101 });
    await activeCompany(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, "Hủy kích hoạt tài khoản nhà tuyển dụng thành công!");
  });

  it("TC144 - Thiếu id_ntd → báo lỗi “Vui lòng cung cấp ID nhà tuyển dụng”", async () => {
    delete req.body.id_ntd;
    await activeCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Vui lòng cung cấp ID nhà tuyển dụng", 400);
  });

  it("TC145 - Không tìm thấy nhà tuyển dụng → báo lỗi “Không tìm thấy nhà tuyển dụng”", async () => {
    Users.findOneAndUpdate.mockResolvedValue(null);
    await activeCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Không tìm thấy nhà tuyển dụng", 404);
  });

});
