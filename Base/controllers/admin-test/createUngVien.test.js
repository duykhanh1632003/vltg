const { createUngVien } = require("../vieclamtheogio/admin");
const Users = require("../../models/ViecLamTheoGio/Users");
const UvCvmm = require("../../models/ViecLamTheoGio/UvCvmm");
const functions = require("../../services/functions");
const md5 = require("md5");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../models/ViecLamTheoGio/UvCvmm");
jest.mock("../../services/functions");
jest.mock("md5", () => jest.fn(() => "hashedpassword"));

describe("createUngVien", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        userName: "Test User",
        phone: "0912345678",
        email: "test@example.com",
        password: "password123",
        city: "HCM",
        district: "1",
        address: "123 Street",
        uv_congviec: "Developer",
        uv_diadiem: ["10", "20"],
        uv_nganhnghe: ["1", "2"],
        day: ["Monday", "Tuesday"],
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
    functions.convertTimestamp.mockReturnValue(1700000000);
    functions.uploadFileNameRandom.mockResolvedValue("avatar.png");
    functions.renderAlias.mockReturnValue("test-user");
    functions.getMaxIdByField.mockResolvedValue(1);
    functions.success = jest.fn();
    functions.setError = jest.fn();
  });

  it("TC30 nên tạo ứng viên thành công với dữ liệu hợp lệ", async () => {
    Users.findOne.mockResolvedValue(null);
    Users.prototype.save = jest.fn().mockResolvedValue(true);
    UvCvmm.prototype.save = jest.fn().mockResolvedValue(true);

    await createUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Create ung vien sucess!");
  });

  it("TC31 nên trả lỗi nếu userName rỗng", async () => {
    req.body.userName = "";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC32 nên trả lỗi nếu phone rỗng", async () => {
    req.body.phone = "     ";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC33 nên trả lỗi nếu email rỗng", async () => {
    req.body.email = "";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC34 nên trả lỗi nếu password rỗng", async () => {
    req.body.password = "";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC35 nên trả lỗi nếu city rỗng", async () => {
    req.body.city = "";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC36 nên trả lỗi nếu district rỗng", async () => {
    req.body.district = "";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC37 nên trả lỗi nếu address rỗng", async () => {
    req.body.address = "";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC38 nên trả lỗi nếu uv_congviec rỗng", async () => {
    req.body.uv_congviec = "";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC39 nên trả lỗi nếu uv_nganhnghe là mảng rỗng", async () => {
    req.body.uv_nganhnghe = [];
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC40 nên trả lỗi nếu uv_diadiem là mảng rỗng", async () => {
    req.body.uv_diadiem = [];
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC41 nên trả lỗi nếu day là mảng rỗng", async () => {
    req.body.day = [];
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC42 nên trả lỗi nếu email không hợp lệ", async () => {
    functions.checkEmail.mockReturnValue(false);
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "phone or email invalid", 401);
  });

  it("TC43 nên trả lỗi nếu số điện thoại không hợp lệ", async () => {
    functions.checkPhoneNumber.mockReturnValue(false);
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "phone or email invalid", 401);
  });

  it("TC44 nên trả lỗi nếu email đã tồn tại", async () => {
    Users.findOne.mockResolvedValue({ email: "test@example.com" });
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Email da ton tai!");
  });

  it("TC45 nên trả lỗi nếu file ảnh không hợp lệ", async () => {
    functions.checkFile.mockResolvedValue(false);
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Invalid image", 400);
  });

  it("TC46 nên xử lý được nếu không có avatar", async () => {
    delete req.files.avatar;
    Users.findOne.mockResolvedValue(null);
    Users.prototype.save = jest.fn().mockResolvedValue(true);
    UvCvmm.prototype.save = jest.fn().mockResolvedValue(true);
    await createUngVien(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, "Create ung vien sucess!");
  });

  it("TC47 nên trả lỗi nếu có exception xảy ra", async () => {
    Users.findOne.mockRejectedValue(new Error("Lỗi bất ngờ"));
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Lỗi bất ngờ");
  });
  it("TC48 nên trả lỗi nếu số điện thoại không đúng định dạng (ví dụ: chỉ có 2 chữ số)", async () => {
    req.body.phone = "12";
    functions.checkPhoneNumber.mockReturnValue(false); // Giả định hàm kiểm tra sai
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "phone or email invalid", 401);
  });

  it("TC49 nên trả lỗi nếu email chỉ chứa khoảng trắng", async () => {
    req.body.email = "   ";
    functions.checkEmail.mockReturnValue(false);
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "phone or email invalid", 401);
  });

  it("TC50 nên trả lỗi nếu email sai định dạng (ví dụ: khanh.com)", async () => {
    req.body.email = "khanh.com";
    functions.checkEmail.mockReturnValue(false);
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "phone or email invalid", 401);
  });

});
