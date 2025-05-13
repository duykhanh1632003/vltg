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
        id_ntd: "123", // chuỗi sẽ được ép kiểu sang số
        active: 1,
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };

    functions.success = jest.fn();
    functions.setError = jest.fn();
  });

  it("TC69 Kích hoạt công ty thành công với id và active hợp lệ", async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: 123 });

    await activeCompany(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 123, type: 1 },
      { active: 1 }
    );
    expect(functions.success).toHaveBeenCalledWith(res, "active nguoi tuyen dung thanh cong!");
  });

  it("TC70 Nếu không truyền active", async () => {
    req.body = { id_ntd: "456" }; // không có active
    Users.findOneAndUpdate.mockResolvedValue({ _id: 456 });

    await activeCompany(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 456, type: 1 },
      { active: 0 }
    );
    expect(functions.success).toHaveBeenCalledWith(res, "active nguoi tuyen dung thanh cong!");
  });

  it("TC71 Thiếu id_ntd", async () => {
    req.body = { active: 1 };

    await activeCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input id_ntd", 400);
  });

  it("TC72 Không tìm thấy người tuyển dụng", async () => {
    Users.findOneAndUpdate.mockResolvedValue(null);

    await activeCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Nguoi tuyen dung not found!", 404);
  });
});
