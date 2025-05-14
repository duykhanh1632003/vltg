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

describe("changeInfoAdminLogin - Cập nhật email admin", () => {
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

  it("✅ TC04: Cập nhật email admin - Trả về message thành công khi cập nhật email", async () => {
    AdminUser.findOne.mockResolvedValue({ adm_id: 123 });
    functions.checkEmail.mockResolvedValue(true);
    AdminUser.findOneAndUpdate.mockResolvedValue({ adm_email: "admin@example.com" });

    await changeInfoAdminLogin(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Cập nhật email thành công");
  });

  it("❌ TC05: Cập nhật email admin - Trả về lỗi nếu email rỗng", async () => {
    AdminUser.findOne.mockResolvedValue({ adm_id: 123 });
    req.body.email = "";
    functions.checkEmail.mockResolvedValue(false);

    await changeInfoAdminLogin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Vui lòng nhập email mới", 400);
  });

  it("❌ TC06: Cập nhật email admin - Trả về lỗi nếu email sai định dạng", async () => {
    AdminUser.findOne.mockResolvedValue({ adm_id: 123 });
    req.body.email = "adminexample.com";
    functions.checkEmail.mockResolvedValue(false);

    await changeInfoAdminLogin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Email sai định dạng", 400);
  });

  it("❌ TC07: Cập nhật email admin - Trả về lỗi nếu email đã được sử dụng", async () => {
    AdminUser.findOne.mockResolvedValue({ adm_id: 123 });
    req.body.email = "existing@example.com";
    functions.checkEmail.mockResolvedValue(true);
    AdminUser.findOneAndUpdate.mockResolvedValue(null); // Mô phỏng email đã tồn tại

    await changeInfoAdminLogin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Email đã được sử dụng, vui lòng chọn email khác", 409);
  });

  it("❌ TC08: Cập nhật email admin - Trả về lỗi nếu email quá dài", async () => {
    AdminUser.findOne.mockResolvedValue({ adm_id: 123 });
    req.body.email = "a".repeat(256) + "@example.com";
    functions.checkEmail.mockResolvedValue(false);

    await changeInfoAdminLogin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Email quá dài, vui lòng kiểm tra lại", 400);
  });

  it("❌ TC09: Cập nhật email admin - Trả về lỗi 404 nếu không tìm thấy admin khi cập nhật", async () => {
    AdminUser.findOne.mockResolvedValue(null);

    await changeInfoAdminLogin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Không tìm thấy admin!", 404);
  });

  it("✅ TC10: Cập nhật email admin - Trả về lỗi hệ thống nếu xảy ra lỗi không xác định", async () => {
    const error = new Error("Lỗi không xác định");
    AdminUser.findOne.mockRejectedValue(error);

    await changeInfoAdminLogin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Lỗi không xác định");
  });
});
