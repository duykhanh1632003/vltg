const { activeUngVien } = require("../../controllers/vieclamtheogio/admin");
const Users = require("../../models/ViecLamTheoGio/Users");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../services/functions");

describe("Use Case: Admin xóa tài khoản người dùng (kích hoạt / hủy kích hoạt tài khoản)", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        id_uv: 1,
        active: 1, // 1: active, 0: unactive
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };

    functions.success = jest.fn();
    functions.setError = jest.fn();

    jest.clearAllMocks();
  });

  // Luồng ngoại lệ 3.1
  it("TC73 - Ngoại lệ: Thiếu id ứng viên", async () => {
    req.body.id_uv = null;

    await activeUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu id ứng viên", 400);
  });

  // Luồng chính: từ active → unactive
  it("TC74 - Hủy kích hoạt tài khoản ứng viên thành công (active → unactive)", async () => {
    req.body.active = 0;

    Users.findOneAndUpdate.mockResolvedValue({ _id: 1, active: 0 });

    await activeUngVien(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 1, type: 0 },
      { active: 0 }
    );
    expect(functions.success).toHaveBeenCalledWith(res, "Hủy kích hoạt tài khoản thành công!");
  });

  // Luồng chính: từ unactive → active
  it("TC75 - Kích hoạt tài khoản ứng viên thành công (unactive → active)", async () => {
    req.body.active = 1;

    Users.findOneAndUpdate.mockResolvedValue({ _id: 1, active: 1 });

    await activeUngVien(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 1, type: 0 },
      { active: 1 }
    );
    expect(functions.success).toHaveBeenCalledWith(res, "Kích hoạt tài khoản thành công!");
  });

  // Luồng phụ: không tìm thấy ứng viên
  it("TC76 - Không tìm thấy ứng viên để cập nhật", async () => {
    Users.findOneAndUpdate.mockResolvedValue(null);

    await activeUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Không tìm thấy ứng viên!", 404);
  });

});
