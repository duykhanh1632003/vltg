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
        avatar: { path: "/tmp/avatar.png" },
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

  it("TC53 nên tạo công ty thành công với dữ liệu hợp lệ", async () => {
    Users.findOne.mockResolvedValue(null);
    Users.prototype.save = jest.fn().mockResolvedValue(true);

    await createCompany(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Create nha tuyen dung sucess!");
  });

  it("TC54 nên trả lỗi nếu thiếu trường bắt buộc", async () => {
    req.body.userName = "";

    await createCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC55 nên trả lỗi nếu số điện thoại không hợp lệ", async () => {
    req.body.phone = "abc123";

    functions.checkPhoneNumber.mockReturnValue(false);
    
    await createCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "phone or email invalid", 401);
  });

  it("TC56 nên trả lỗi nếu email không hợp lệ", async () => {
    req.body.email = "invalid-email";
    functions.checkEmail.mockReturnValue(false);

    await createCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "phone or email invalid", 401);
  });

  it("TC57 nên trả lỗi nếu email đã tồn tại", async () => {
    Users.findOne.mockResolvedValue({ email: "company@example.com" });

    await createCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Email da ton tai");
  });

  it("TC58 nên trả lỗi nếu file avatar không hợp lệ", async () => {
    functions.checkFile.mockResolvedValue(false);

    await createCompany(req, res);
  });

  it("TC59 nên xử lý nếu không có avatar", async () => {
    delete req.files.avatar;

    Users.findOne.mockResolvedValue(null);
    Users.prototype.save = jest.fn().mockResolvedValue(true);

    await createCompany(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Create nha tuyen dung sucess!");
  });

  it("TC60 nên trả lỗi nếu không thể lưu công ty", async () => {
    Users.findOne.mockResolvedValue(null);
    Users.prototype.save = jest.fn().mockResolvedValue(null);

    await createCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Create nha tuyen dung fail!");
  });

});
