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

  it("TC61 Cập nhật thành công khi dữ liệu hợp lệ", async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: 101 });

    await updateCompany(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Update ung vien sucess!");
  });

  it("TC62 Thiếu dữ liệu đầu vào", async () => {
    delete req.body.email;

    await updateCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC63 Số điện thoại không hợp lệ – ví dụ: 'abc'", async () => {
    req.body.phone = "abc";
    functions.checkPhoneNumber.mockReturnValue(false);

    await updateCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "phone or email invalid", 401);
  });

  it("TC64 Email không hợp lệ – ví dụ: 'bad-email'", async () => {
    req.body.email = "bad-email";
    functions.checkEmail.mockReturnValue(false);

    await updateCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "phone or email invalid", 401);
  });

  it("TC65 File avatar không hợp lệ", async () => {
    functions.checkFile.mockResolvedValue(false);

    await updateCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Invalid image", 400);
  });

  it("TC66 Cập nhật không có avatar (không upload)", async () => {
    delete req.files.avatar;
    Users.findOneAndUpdate.mockResolvedValue({ _id: 101 });

    await updateCompany(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Update ung vien sucess!");
  });

  it("TC67 Không tìm thấy công ty để cập nhật", async () => {
    Users.findOneAndUpdate.mockResolvedValue(null);

    await updateCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Ung vien not found!");
  });

  it("TC68 Bắt exception và trả lỗi rõ ràng", async () => {
    Users.findOneAndUpdate.mockRejectedValue(new Error("DB connection failed"));

    await updateCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "DB connection failed");
  });
});
