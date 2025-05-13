const { activeUngVien } = require("../../controllers/vieclamtheogio/admin");
const Users = require("../../models/ViecLamTheoGio/Users");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../services/functions");

describe("activeUngVien", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        id_uv: 1,
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

  it("TC48 nên active ứng viên thành công khi dữ liệu hợp lệ", async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: 1, active: 1 });

    await activeUngVien(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 1, type: 0 },
      { active: 1 }
    );
    expect(functions.success).toHaveBeenCalledWith(res, "active ung vien thanh cong!");
  });

  it("TC49 nên set active = 0 nếu không truyền trường active", async () => {
    delete req.body.active;
    Users.findOneAndUpdate.mockResolvedValue({ _id: 1, active: 0 });

    await activeUngVien(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 1, type: 0 },
      { active: 0 }
    );
    expect(functions.success).toHaveBeenCalledWith(res, "active ung vien thanh cong!");
  });

  it("TC50 nên trả lỗi nếu không tìm thấy ứng viên", async () => {
    Users.findOneAndUpdate.mockResolvedValue(null);

    await activeUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Ung vien not found!", 404);
  });

  it("TC51 nên trả lỗi nếu thiếu id_uv", async () => {
    delete req.body.id_uv;

    await activeUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input id_uv", 400);
  });

  it("TC52 nên xử lý exception và trả lỗi phù hợp", async () => {
    Users.findOneAndUpdate.mockRejectedValue(new Error("Unexpected error"));

    await activeUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Unexpected error");
  });
});
