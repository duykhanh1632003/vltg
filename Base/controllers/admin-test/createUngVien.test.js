const { createUngVien } = require("../vieclamtheogio/admin");
const Users = require("../../models/ViecLamTheoGio/Users");
const UvCvmm = require("../../models/ViecLamTheoGio/UvCvmm");
const functions = require("../../services/functions");
const md5 = require("md5");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../models/ViecLamTheoGio/UvCvmm");
jest.mock("../../services/functions");
jest.mock("md5", () => jest.fn(() => "hashedpassword"));

describe("createUngVien - kiểm thử đầy đủ đặc tả và nhập toàn khoảng trắng", () => {
  let req, res;
  afterEach(() => {
    jest.clearAllMocks(); // Xóa sạch mọi mock calls
  });
  
  beforeEach(() => {
    req = {
      body: {
        userName: "Nguyễn Văn A",
        phone: "0912345678",
        email: "test@example.com",
        password: "123456",
        city: "Hà Nội",
        district: "Ba Đình",
        address: "Số 1 Đường ABC",
        uv_congviec: "Nhân viên IT",
        uv_diadiem: ["1", "2"],
        uv_nganhnghe: ["CNTT", "Kỹ thuật"],
        day: ["Monday", "Tuesday"]
      },
      files: {
        avatar: { path: "/tmp/avatar.png" }
      }
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    };
    Users.findOne.mockResolvedValue(null)
    functions.checkPhoneNumber.mockReturnValue(true);
    functions.checkEmail.mockReturnValue(true);
    functions.checkFile.mockResolvedValue(true);
    functions.convertTimestamp.mockReturnValue(1700000000);
    functions.uploadFileNameRandom.mockResolvedValue("avatar.png");
    functions.renderAlias.mockReturnValue("nguyen-van-a");
    functions.getMaxIdByField.mockResolvedValue(1);
    functions.success = jest.fn();
    functions.setError = jest.fn();
    jest.clearAllMocks();
  });

  // ---- Đặc tả chính ----
  it("TC20 - Tạo ứng viên - Tạo ứng viên thành công nếu hợp lệ", async () => {
    Users.findOne.mockResolvedValue(null);
    Users.prototype.save = jest.fn().mockResolvedValue(true);
    UvCvmm.prototype.save = jest.fn().mockResolvedValue(true);

    await createUngVien(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, "Tạo ứng viên thành công!");
  });

  it("TC21 - Tạo ứng viên - Thiếu userName", async () => {
    req.body.userName = "";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu tên ứng viên", 400);
  });

  it("TC22 - Tạo ứng viên - userName toàn khoảng trắng", async () => {
    req.body.userName = "   ";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu tên ứng viên", 400);
  });

  it("TC23 - Tạo ứng viên - Sai định dạng email", async () => {
    functions.checkEmail.mockReturnValue(false);
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Báo lỗi sai định dạng email", 401);
  });

  it("TC24 - Tạo ứng viên - Số điện thoại sai định dạng", async () => {
    functions.checkPhoneNumber.mockReturnValue(false);
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Số điện thoại hiển thị không hợp lệ", 401);
  });

  it("TC25 - Tạo ứng viên - Email đã tồn tại", async () => {
    Users.findOne.mockResolvedValue(true);
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "email đã tồn tại", 400);
  });

  it("TC26 - Tạo ứng viên - Thiếu địa điểm hoặc ngành nghề", async () => {
    req.body.uv_diadiem = [];
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Vui lòng nhập đầy đủ thông tin!", 400);
  });

  it("TC27 - Tạo ứng viên - Không chọn buổi làm", async () => {
    req.body.day = [];
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Vui lòng chọn ca có thể đi làm!", 400);
  });

  it("TC28 - Tạo ứng viên - Mật khẩu < 6 ký tự", async () => {
    req.body.password = "123";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "mật khẩu ít nhất 6 ký tự", 400);
  });

  it("TC29 - Tạo ứng viên - Email dài hơn 255 ký tự", async () => {
    req.body.email = "a".repeat(256) + "@example.com";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "email quá dài", 400);
  });

  it("TC30 - Tạo ứng viên - Kiểm tra giới hạn dung lượng ảnh", async () => {
    functions.checkFile.mockResolvedValue(false);
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Ảnh không được vượt quá 5MB", 400);
  });

  it("TC31 - Tạo ứng viên - Kiểm tra định dạng file (PDF)", async () => {
    req.files.avatar.path = "/tmp/avatar.pdf";
    functions.checkFile.mockResolvedValue(false);
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Chỉ cho phép định dạng ảnh JPG, JPEG, PNG", 400);
  });

  it("TC32 - Tạo ứng viên - File không hợp lệ", async () => {
    req.files.avatar.path = "/tmp/file.doc";
    functions.checkFile.mockResolvedValue(false);
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "File không hợp lệ. Vui lòng chọn ảnh.", 400);
  });

  // ---- Kiểm tra nhập toàn space ----
  it("TC33 - Tạo ứng viên - userName toàn khoảng trắng", async () => {
    req.body.userName = "   ";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu tên ứng viên", 400);
  });

  it("TC34 - Tạo ứng viên - phone toàn khoảng trắng", async () => {
    req.body.phone = "   ";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu số điện thoại", 400);
  });

  it("TC35 - Tạo ứng viên - email toàn khoảng trắng", async () => {
    req.body.email = "   ";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu email", 400);
  });

  it("TC36 - Tạo ứng viên - password toàn khoảng trắng", async () => {
    req.body.password = "   ";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu mật khẩu", 400);
  });

  it("TC37 - Tạo ứng viên - city toàn khoảng trắng", async () => {
    req.body.city = "   ";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu tỉnh/thành", 400);
  });

  it("TC38 - Tạo ứng viên - district toàn khoảng trắng", async () => {
    req.body.district = "   ";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu quận/huyện", 400);
  });

  it("TC39 - Tạo ứng viên - address toàn khoảng trắng", async () => {
    req.body.address = "   ";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu địa chỉ ứng viên", 400);
  });

  it("TC40 - Tạo ứng viên - uv_congviec toàn khoảng trắng", async () => {
    req.body.uv_congviec = "   ";
    await createUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu công việc mong muốn", 400);
  });
});
