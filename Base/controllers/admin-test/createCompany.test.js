const { createCompany } = require("../../controllers/vieclamtheogio/admin");
const Users = require("../../models/ViecLamTheoGio/Users");
const functions = require("../../services/functions");
const md5 = require("md5");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../services/functions");
jest.mock("md5", () => jest.fn(() => "hashedpassword"));

describe("createCompany", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        userName: "Công ty A",
        phone: "0912345678",
        email: "company@example.com",
        password: "securepass",
        city: "HCM",
        district: "1",
        address: "123 Company Street",
      },
      files: {
        avatar: { path: "/tmp/avatar.png", name: "avatar.png", size: 1024 * 1024 },
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };

    functions.checkPhoneNumber.mockReturnValue(true);
    functions.checkEmail.mockReturnValue(true);
    functions.checkFile.mockResolvedValue(true);
    functions.uploadFileNameRandom.mockResolvedValue("avatar.png");
    functions.convertTimestamp.mockReturnValue(1700000000);
    functions.renderAlias.mockReturnValue("cong-ty-a");
    functions.getMaxIdByField.mockResolvedValue(99);
    functions.success = jest.fn();
    functions.setError = jest.fn();
  });

 // ✅ TC96: Tạo công ty thành công với đầy đủ dữ liệu
it("✅ TC96: tạo công ty thành công", async () => {
    Users.findOne.mockResolvedValue(null);
    Users.prototype.save = jest.fn().mockResolvedValue(true);
  
    await createCompany(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, "Tạo nhà tuyển dụng thành công!");
  });
  
  // ❌ TC97: Thiếu tên công ty
  it("❌ TC97: Thiếu tên công ty", async () => {
    req.body.userName = "";
  
    await createCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Vui lòng nhập tên công ty", 400);
  });
  
  // ❌ TC98: Trường số điện thoại chỉ có khoảng trắng
  it("❌ TC98: Trường số điện thoại chỉ có khoảng trắng", async () => {
    req.body.phone = "   ";
  
    await createCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Vui lòng nhập số điện thoại", 400);
  });
  
  // ❌ TC99: Email đã tồn tại
  it("❌ TC99: Email đã tồn tại", async () => {
    Users.findOne.mockResolvedValue({ email: req.body.email });
  
    await createCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Email đã tồn tại", 400);
  });
  
  // ❌ TC100: Email sai định dạng
  it("❌ TC100: Email sai định dạng", async () => {
    req.body.email = "invalidemail";
    functions.checkEmail.mockReturnValue(false);
  
    await createCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Sai định dạng email", 400);
  });
  
  // ❌ TC101: Mật khẩu dưới 6 ký tự
  it("❌ TC101: Mật khẩu dưới 6 ký tự", async () => {
    req.body.password = "123";
  
    await createCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Mật khẩu ít nhất 6 ký tự", 400);
  });
  
  // ❌ TC102: Số điện thoại không hợp lệ
  it("❌ TC102: Số điện thoại không hợp lệ", async () => {
    req.body.phone = "abc123";
    functions.checkPhoneNumber.mockReturnValue(false);
  
    await createCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Số điện thoại không hợp lệ", 400);
  });
  
  // ❌ TC103: Email quá dài
  it("❌ TC103: Email quá dài", async () => {
    req.body.email = "a".repeat(256) + "@example.com";
  
    await createCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Email không được vượt quá 255 ký tự", 400);
  });
  
  // ❌ TC104: Ảnh vượt quá 5MB
  it("❌ TC104: Ảnh vượt quá 5MB", async () => {
    req.files.avatar.size = 6 * 1024 * 1024;
    functions.checkFile.mockImplementation(() => {
      throw new Error("Ảnh không được vượt quá 5MB");
    });
  
    await createCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Ảnh không được vượt quá 5MB", 400);
  });
  
  // ❌ TC105: Ảnh sai định dạng (GIF)
  it("❌ TC105: Ảnh sai định dạng", async () => {
    req.files.avatar.name = "avatar.gif";
    functions.checkFile.mockImplementation(() => {
      throw new Error("Chỉ cho phép định dạng ảnh JPG, JPEG, PNG");
    });
  
    await createCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Chỉ cho phép định dạng ảnh JPG, JPEG, PNG", 400);
  });
  
  // ⚠️ TC106: Cảnh báo kích thước ảnh nhưng vẫn cho tạo
  it("⚠️ TC106: Cảnh báo kích thước ảnh", async () => {
    functions.checkFile.mockResolvedValue({
      valid: true,
      warning: "Nên sử dụng ảnh 190x190 để hiển thị tối ưu",
    });
  
    Users.findOne.mockResolvedValue(null);
    Users.prototype.save = jest.fn().mockResolvedValue(true);
  
    await createCompany(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, "Tạo nhà tuyển dụng thành công!");
  });
  
  // ❌ TC107: File không phải ảnh
  it("❌ TC107: File không phải ảnh", async () => {
    req.files.avatar.name = "doc.pdf";
    functions.checkFile.mockImplementation(() => {
      throw new Error("File không hợp lệ. Vui lòng chọn ảnh.");
    });
  
    await createCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "File không hợp lệ. Vui lòng chọn ảnh.", 400);
  });
  
  // ✅ TC108: Không có avatar nhưng vẫn tạo được
  it("✅ TC108: Không có avatar", async () => {
    delete req.files.avatar;
    Users.findOne.mockResolvedValue(null);
    Users.prototype.save = jest.fn().mockResolvedValue(true);
  
    await createCompany(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, "Tạo nhà tuyển dụng thành công!");
  });
  
  // ❌ TC109: Không thể lưu công ty (save trả về null)
  it("❌ TC109: Không thể lưu công ty", async () => {
    Users.findOne.mockResolvedValue(null);
    Users.prototype.save = jest.fn().mockResolvedValue(null);
  
    await createCompany(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Tạo nhà tuyển dụng thất bại!", 400);
  });
  

  // ❌ TC110 → TC123: Kiểm tra các trường bắt buộc có giá trị rỗng hoặc space
const requiredFields = {
    userName: "tên công ty",
    phone: "số điện thoại",
    email: "email",
    password: "mật khẩu",
    city: "tỉnh/thành phố",
    district: "quận/huyện",
    address: "địa chỉ",
  };
  
  let tc = 110;
  
  for (const [field, label] of Object.entries(requiredFields)) {
    it(`❌ TC${tc++}: Thiếu ${label}`, async () => {
      req.body[field] = "";
      await createCompany(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, `Vui lòng nhập ${label}`, 400);
    });
  
    it(`❌ TC${tc++}: Chỉ nhập khoảng trắng cho ${label}`, async () => {
      req.body[field] = "   ";
      await createCompany(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, `Vui lòng nhập ${label}`, 400);
    });
  }
  
});
