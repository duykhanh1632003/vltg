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
  
    it("❌ TC11: Đổi mật khẩu - Trả về lỗi nếu không nhập mật khẩu cũ", async () => {
      req.body = { newPass: "123456", confirmPass: "123456" };
      AdminUser.findOne.mockResolvedValue({ adm_password: "oldhash" });
  
      await changePasswordAdminLogin(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, "Vui lòng nhập mật khẩu cũ.", 400);
    });
  
    it("❌ TC12: Đổi mật khẩu - Trả về lỗi nếu không nhập mật khẩu mới", async () => {
      req.body = { oldPass: "oldpass", confirmPass: "123456" };
      AdminUser.findOne.mockResolvedValue({ adm_password: "oldhash" });
  
      await changePasswordAdminLogin(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, "Vui lòng nhập mật khẩu mới.", 400);
    });
  
    it("❌ TC13: Đổi mật khẩu - Trả về lỗi nếu không nhập xác nhận mật khẩu", async () => {
      req.body = { oldPass: "oldpass", newPass: "123456" };
      AdminUser.findOne.mockResolvedValue({ adm_password: "oldhash" });
  
      await changePasswordAdminLogin(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, "Vui lòng xác nhận mật khẩu xác minh.", 400);
    });
  
    it("❌ TC14: Đổi mật khẩu - Trả về lỗi nếu mật khẩu mới và xác nhận không khớp", async () => {
      req.body = { oldPass: "oldpass", newPass: "123456", confirmPass: "654321" };
      AdminUser.findOne.mockResolvedValue({ adm_password: "oldhash" });
  
      await changePasswordAdminLogin(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, "Mật khẩu mới và xác nhận không khớp", 400);
    });
  
    it("❌ TC15: Đổi mật khẩu - Trả về lỗi nếu mật khẩu mới dưới 6 ký tự", async () => {
      req.body = { oldPass: "oldpass", newPass: "123", confirmPass: "123" };
      AdminUser.findOne.mockResolvedValue({ adm_password: "oldhash" });
  
      await changePasswordAdminLogin(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, "Mật khẩu mới phải lớn hơn 6 ký tự", 400);
    });
  
    it("❌ TC16: Đổi mật khẩu - Trả về lỗi nếu mật khẩu cũ không đúng", async () => {
      req.body = { oldPass: "wrongpass", newPass: "123456", confirmPass: "123456" };
      AdminUser.findOne.mockResolvedValue({ adm_password: "oldhash" });
      functions.verifyPassword = jest.fn().mockResolvedValue(false);
  
      await changePasswordAdminLogin(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, "Mật khẩu hiện tại không chính xác.", 401);
    });
  
    it("❌ TC17: Đổi mật khẩu - Trả về lỗi nếu không tìm thấy admin", async () => {
      AdminUser.findOne.mockResolvedValue(null);
  
      await changePasswordAdminLogin(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, "Không tìm thấy admin", 404);
    });
  
    it("❌ TC18: Đổi mật khẩu - Trả về lỗi nếu cập nhật mật khẩu thất bại", async () => {
      req.body = { oldPass: "correctpass", newPass: "123456", confirmPass: "123456" };
      AdminUser.findOne.mockResolvedValue({ adm_password: "oldhash" });
      functions.verifyPassword = jest.fn().mockResolvedValue(true);
      AdminUser.findOneAndUpdate.mockResolvedValue(null);
  
      await changePasswordAdminLogin(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, "Cập nhật mật khẩu thất bại!", 500);
    });
  
    it("✅ TC19: Đổi mật khẩu - Đổi mật khẩu thành công", async () => {
      req.body = { oldPass: "correctpass", newPass: "123456", confirmPass: "123456" };
      AdminUser.findOne.mockResolvedValue({ adm_password: "oldhash" });
      functions.verifyPassword = jest.fn().mockResolvedValue(true);
      AdminUser.findOneAndUpdate.mockResolvedValue({ adm_id: 1 });
  
      await changePasswordAdminLogin(req, res);
  
      expect(AdminUser.findOneAndUpdate).toHaveBeenCalledWith(
        { adm_id: 1 },
        { adm_password: md5("123456") },
        { new: true }
      );
      expect(functions.success).toHaveBeenCalledWith(res, "Cập nhật mật khẩu thành công");
    });
  });
  