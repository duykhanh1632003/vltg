const { changeInfoAdminLogin } = require("../../controllers/vieclamtheogio/admin");
const functions = require("../../services/functions");
const AdminUser = require("../../models/ViecLamTheoGio/AdminUser");

jest.mock("../../services/functions");
jest.mock("../../models/ViecLamTheoGio/AdminUser");

beforeEach(() => {
  jest.clearAllMocks();
  functions.setError = jest.fn();
  functions.success = jest.fn();
});

describe("changeInfoAdminLogin", () => {
  let req, res;

  beforeEach(() => {
    req = {
      infoAdmin: { adm_id: 123 },
      body: { email: "admin@example.com" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("✅ TC09: Cập nhật thành công", async () => {
    AdminUser.findOne.mockResolvedValue({ adm_id: 123 });
    functions.checkEmail.mockResolvedValue(true);
    AdminUser.findOneAndUpdate.mockResolvedValue({ adm_email: "admin@example.com" });

    await changeInfoAdminLogin(req, res);

    expect(AdminUser.findOne).toHaveBeenCalledWith({ adm_id: 123 });
    expect(functions.checkEmail).toHaveBeenCalledWith("admin@example.com");
    expect(AdminUser.findOneAndUpdate).toHaveBeenCalledWith(
      { adm_id: 123 },
      { adm_email: "admin@example.com" },
      { new: true }
    );
    expect(functions.success).toHaveBeenCalledWith(res, "Update info admin success!");
  });

  it("❌ TC10: Không có email hoặc email không hợp lệ", async () => {
    AdminUser.findOne.mockResolvedValue({ adm_id: 123 });
    req.body.email = ""; // Trường hợp thiếu email
    functions.checkEmail.mockResolvedValue(false);

    await changeInfoAdminLogin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input email or invalid email!", 405);
  });

  it("❌ TC11: Cập nhật thất bại", async () => {
    AdminUser.findOne.mockResolvedValue({ adm_id: 123 });
    functions.checkEmail.mockResolvedValue(true);
    AdminUser.findOneAndUpdate.mockResolvedValue(null); // Cập nhật fail

    await changeInfoAdminLogin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Update info admin fail!", 407);
  });

  it("❌ TC12: Không tìm thấy admin", async () => {
    AdminUser.findOne.mockResolvedValue(null);

    await changeInfoAdminLogin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Admin not found!", 404);
  });

  it("❌ TC13: Có lỗi exception", async () => {
    const error = new Error("Something went wrong");
    AdminUser.findOne.mockRejectedValue(error);

    await changeInfoAdminLogin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Something went wrong");
  });
});
