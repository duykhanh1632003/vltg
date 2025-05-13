const { updateUngVien } = require("../../controllers/vieclamtheogio/admin");
const Users = require("../../models/ViecLamTheoGio/Users");
const UvCvmm = require("../../models/ViecLamTheoGio/UvCvmm");
const functions = require("../../services/functions");
const md5 = require("md5");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../models/ViecLamTheoGio/UvCvmm");
jest.mock("../../services/functions");
jest.mock("md5", () => jest.fn(() => "hashedpassword"));

describe("updateUngVien", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        _id: 1,
        userName: "Updated User",
        phone: "0912345678",
        email: "updated@example.com",
        password: "newpass123",
        city: "HCM",
        district: "1",
        address: "456 Updated Street",
        uv_congviec: "Tester",
        uv_diadiem: ["10", "20"],
        uv_nganhnghe: ["1", "2"],
        day: ["Monday", "Friday"],
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
    functions.convertTimestamp.mockReturnValue(1700000000);
    functions.checkFile.mockResolvedValue(true);
    functions.uploadFileNameRandom.mockResolvedValue("newavatar.png");
    functions.renderAlias.mockReturnValue("updated-user");
    functions.success = jest.fn();
    functions.setError = jest.fn();
  });

  it("TC41 nên cập nhật ứng viên thành công với dữ liệu hợp lệ", async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: 1 });
    UvCvmm.findOne.mockResolvedValue({ id_uv_cvmm: 1 });
    UvCvmm.findOneAndUpdate.mockResolvedValue(true);

    await updateUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Update ung vien sucess!");
  });

  it("TC41 nên tạo mới UvCvmm nếu chưa có", async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: 1 });
    UvCvmm.findOne.mockResolvedValue(null);
    UvCvmm.findOneAndUpdate.mockResolvedValue(true);

    await updateUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Update ung vien sucess!");
  });

  it("TC42 nên trả lỗi nếu thiếu trường bắt buộc", async () => {
    req.body.userName = "";
    await updateUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("TC43 nên trả lỗi nếu số điện thoại không hợp lệ, dù email hợp lệ", async () => {
    req.body.phone = "123"; // Không đúng định dạng
    req.body.email = "valid@email.com"; // Hợp lệ
  
    functions.checkPhoneNumber.mockReturnValue(false);
    functions.checkEmail.mockReturnValue(true);
  
    await updateUngVien(req, res);
  
    expect(functions.setError).toHaveBeenCalledWith(res, "phone or email invalid", 401);
  });

  it("TC44 nên trả lỗi nếu email không hợp lệ, dù số điện thoại hợp lệ", async () => {
    req.body.phone = "0912345678"; // Hợp lệ
    req.body.email = "invalid-email"; // Sai định dạng
  
    functions.checkPhoneNumber.mockReturnValue(true);
    functions.checkEmail.mockReturnValue(false);
  
    await updateUngVien(req, res);
  
    expect(functions.setError).toHaveBeenCalledWith(res, "phone or email invalid", 401);
  });
  

  it("TC45 nên trả lỗi nếu ảnh không hợp lệ", async () => {
    functions.checkFile.mockResolvedValue(false);
    await updateUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Invalid image", 400);
  });

  it("TC46 nên xử lý được nếu không có avatar", async () => {
    delete req.files.avatar;
    Users.findOneAndUpdate.mockResolvedValue({ _id: 1 });
    UvCvmm.findOne.mockResolvedValue(null);
    UvCvmm.findOneAndUpdate.mockResolvedValue(true);

    await updateUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Update ung vien sucess!");
  });

  it("TC47 nên trả lỗi nếu không tìm thấy ứng viên", async () => {
    Users.findOneAndUpdate.mockResolvedValue(null);
    await updateUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Ung vien not found!");
  });

});
