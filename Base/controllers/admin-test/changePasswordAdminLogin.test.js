const { changePasswordAdminLogin } = require("../vieclamtheogio/admin");
const AdminUser = require("../../models/ViecLamTheoGio/AdminUser"); 
const functions = require("../../services/functions");
const md5 = require("md5");

jest.mock("../../models/ViecLamTheoGio/AdminUser");
jest.mock("../../services/functions");

describe("changePasswordAdminLogin", () => {
  let req, res;

  beforeEach(() => {
    req = {
      infoAdmin: { adm_id: 1 },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("❌ TC04: Admin không tồn tại", async () => {
    AdminUser.findOne.mockResolvedValue(null);

    await changePasswordAdminLogin(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Admin not found!", 404);
  });

  it("❌ TC05: Thiếu oldPass hoặc newPass", async () => {
    AdminUser.findOne.mockResolvedValue({ adm_password: "oldhash" });
    req.body = {}; // thiếu thông tin

    await changePasswordAdminLogin(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 405);
  });

  it("❌ TC06: Sai mật khẩu cũ", async () => {
    AdminUser.findOne.mockResolvedValue({ adm_password: "oldhash" });
    req.body = { oldPass: "wrongpass", newPass: "newpass" };
    functions.verifyPassword = jest.fn().mockResolvedValue(false);

    await changePasswordAdminLogin(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Wrong password!", 406);
  });

  it("❌ TC07: Cập nhật mật khẩu thất bại", async () => {
    AdminUser.findOne.mockResolvedValue({ adm_password: "oldhash" });
    req.body = { oldPass: "correct", newPass: "newpass" };
    functions.verifyPassword = jest.fn().mockResolvedValue(true);
    AdminUser.findOneAndUpdate.mockResolvedValue(null);

    await changePasswordAdminLogin(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Update password fail!", 407);
  });

  it("✅ TC08: Đổi mật khẩu thành công", async () => {
    AdminUser.findOne.mockResolvedValue({ adm_password: "oldhash" });
    req.body = { oldPass: "correct", newPass: "newpass" };
    functions.verifyPassword = jest.fn().mockResolvedValue(true);
    AdminUser.findOneAndUpdate.mockResolvedValue({ adm_id: 1 });

    await changePasswordAdminLogin(req, res);
    expect(AdminUser.findOneAndUpdate).toHaveBeenCalledWith(
      { adm_id: 1 },
      { adm_password: md5("newpass") },
      { new: true }
    );
    expect(functions.success).toHaveBeenCalledWith(res, "Update password success!");
  });
});
