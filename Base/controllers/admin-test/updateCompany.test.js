// __tests__/updateCompany.test.js
const { updateCompany } = require("../../controllers/vieclamtheogio/admin");
const Users = require("../../models/ViecLamTheoGio/Users");
const functions = require("../../services/functions");
const md5 = require("md5");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../services/functions");
jest.mock("md5", () => jest.fn(() => "hashedpassword"));

describe("updateCompany", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        _id: "101",
        userName: "Công ty B",
        phone: "0987654321",
        email: "update@company.com",
        password: "newpass123",
        city: "Hà Nội",
        district: "Hoàn Kiếm",
        address: "456 Phố Huế",
      },
      files: {
        avatar: { path: "/tmp/avatar.jpg" },
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };

    functions.checkPhoneNumber.mockReturnValue(true);
    functions.checkEmail.mockReturnValue(true);
    functions.checkFile.mockResolvedValue(true);
    functions.uploadFileNameRandom.mockResolvedValue("avatar-updated.jpg");
    functions.convertTimestamp.mockReturnValue(1711111111);
    functions.renderAlias.mockReturnValue("cong-ty-b");
    functions.success = jest.fn();
    functions.setError = jest.fn();
  });

  it("✅ TC124: Cập nhật thành công khi dữ liệu hợp lệ", async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: 101 });
    await updateCompany(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, "Cập nhật công ty thành công!");
  });

  it("❌ TC125: Số điện thoại không hợp lệ – ví dụ: 'abc'", async () => {
    req.body.phone = "abc";
    functions.checkPhoneNumber.mockReturnValue(false);
    await updateCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Số điện thoại không hợp lệ", 400);
  });

  it("❌ TC126: Email không hợp lệ – ví dụ: 'bad-email'", async () => {
    req.body.email = "bad-email";
    functions.checkEmail.mockReturnValue(false);
    await updateCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Sai định dạng email", 400);
  });

  it("❌ TC127: File avatar không hợp lệ", async () => {
    functions.checkFile.mockResolvedValue(false);
    await updateCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Ảnh không hợp lệ", 400);
  });

  it("✅ TC128: Cập nhật không có avatar (không upload)", async () => {
    delete req.files.avatar;
    Users.findOneAndUpdate.mockResolvedValue({ _id: 101 });
    await updateCompany(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, "Cập nhật công ty thành công!");
  });

  it("❌ TC129: Không tìm thấy công ty để cập nhật", async () => {
    Users.findOneAndUpdate.mockResolvedValue(null);
    await updateCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Không tìm thấy công ty", 404);
  });

  it("❌ TC130: Email quá dài", async () => {
    req.body.email = "a".repeat(256) + "@mail.com";
    await updateCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Email quá dài", 400);
  });

  it("❌ TC131: Mật khẩu dưới 6 ký tự", async () => {
    req.body.password = "123";
    await updateCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Mật khẩu ít nhất 6 ký tự", 400);
  });

  it("❌ TC132: Upload ảnh vượt quá 5MB", async () => {
    req.files.avatar = { path: "/tmp/avatar.jpg", size: 6 * 1024 * 1024 };
    functions.checkImageSize = jest.fn(() => false);
    await updateCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Ảnh không được vượt quá 5MB", 400);
  });

  it("❌ TC133: Upload ảnh sai định dạng", async () => {
    req.files.avatar = { path: "/tmp/avatar.txt" };
    functions.checkFile.mockResolvedValue(false);
    await updateCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Chỉ cho phép định dạng ảnh JPG, JPEG, PNG", 400);
  });

  it("❌ TC134: Upload ảnh không đúng kích thước", async () => {
    functions.checkImageDimension = jest.fn(() => false);
    await updateCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Nghị ảnh có kích thước 190x190 để hiển thị tối ưu", 400);
  });

  const requiredFields = {
    _id: "mã nhà tuyển dụng",
    userName: "tên công ty",
    phone: "số điện thoại",
    email: "email công ty",
    password: "mật khẩu công ty",
    city: "tỉnh thành",
    district: "quận huyện",
    address: "địa chỉ công ty",
  };

  let tcNumber = 135;
  Object.entries(requiredFields).forEach(([field, label]) => {
    it(`❌ TC${tcNumber++}: Thiếu trường ${field} → báo lỗi "Thiếu ${label}"`, async () => {
      req.body[field] = "";
      await updateCompany(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, `Thiếu ${label}`, 400);
    });

    it(`❌ TC${tcNumber++}: Trường ${field} chỉ chứa khoảng trắng → báo lỗi "Thiếu ${label}"`, async () => {
      req.body[field] = "   ";
      await updateCompany(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, `Thiếu ${label}`, 400);
    });
  });
});
