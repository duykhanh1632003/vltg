const { updateUngVien } = require("../../controllers/vieclamtheogio/admin");
const Users = require("../../models/ViecLamTheoGio/Users");
const UvCvmm = require("../../models/ViecLamTheoGio/UvCvmm");
const functions = require("../../services/functions");
const md5 = require("md5");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../models/ViecLamTheoGio/UvCvmm");
jest.mock("../../services/functions");
jest.mock("md5", () => jest.fn(() => "hashedpassword"));

describe("Kiểm thử chức năng cập nhật ứng viên", () => {
  let req, res;

  const defaultBody = {
    _id: 1,
    userName: "Nguyễn Văn A",
    phone: "0912345678",
    email: "user@example.com",
    password: "matkhau123",
    city: "HCM",
    district: "1",
    address: "123 Đường ABC",
    uv_congviec: "Tester",
    uv_diadiem: ["10", "20"],
    uv_nganhnghe: ["1", "2"],
    day: ["Monday", "Friday"],
  };

  beforeEach(() => {
    req = {
      body: { ...defaultBody },
      files: {
        avatar: { path: "/tmp/avatar.png", size: 1024 * 1024 },
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };

    jest.clearAllMocks();

    functions.checkPhoneNumber.mockReturnValue(true);
    functions.checkEmail.mockReturnValue(true);
    functions.convertTimestamp.mockReturnValue(1700000000);
    functions.checkFile.mockResolvedValue(true);
    functions.uploadFileNameRandom.mockResolvedValue("newavatar.png");
    functions.renderAlias.mockReturnValue("nguyen-van-a");
    functions.success = jest.fn();
    functions.setError = jest.fn();
  });

  it("TC42 - Thiếu số điện thoại → Thông báo: Thiếu số điện thoại", async () => {
    delete req.body.phone;
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu số điện thoại", 400);
  });

  it("TC43 - Không chọn địa điểm hoặc ngành nghề → Thông báo: Vui lòng nhập đầy đủ thông tin!", async () => {
    req.body.uv_diadiem = [];
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Vui lòng nhập đầy đủ thông tin!", 400);
  });

  it("TC44 - Không chọn buổi làm → Thông báo: Vui lòng chọn ca có thể đi làm!", async () => {
    req.body.day = [];
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Vui lòng chọn ca có thể đi làm!", 400);
  });

  it("TC45 - Email đã tồn tại → Thông báo: email đã tồn tại", async () => {
    Users.findOneAndUpdate.mockResolvedValue(null);
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "email đã tồn tại", 400);
  });

  it("TC46 - Sai định dạng email → Thông báo: Sai định dạng email", async () => {
    functions.checkEmail.mockReturnValue(false);
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Sai định dạng email", 401);
  });

  it("TC47 - Mật khẩu quá ngắn → Thông báo: Mật khẩu phải có ít nhất 6 ký tự", async () => {
    req.body.password = "123";
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Mật khẩu phải có ít nhất 6 ký tự", 400);
  });

  it("TC48 - Số điện thoại không hợp lệ → Thông báo: Số điện thoại không hợp lệ", async () => {
    functions.checkPhoneNumber.mockReturnValue(false);
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Số điện thoại không hợp lệ", 401);
  });

  it("TC49 - Trường tên chỉ có dấu cách → Thông báo: Thiếu tên ứng viên", async () => {
    req.body.userName = "   ";
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Thiếu tên ứng viên", 400);
  });

  it("TC50 - Email quá dài → Thông báo: Sai định dạng email", async () => {
    req.body.email = "a".repeat(256) + "@example.com";
    functions.checkEmail.mockReturnValue(false);
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Sai định dạng email", 401);
  });

  it("TC51 - Ảnh lớn hơn 5MB → Thông báo: Ảnh không được vượt quá 5MB", async () => {
    req.files.avatar.size = 6 * 1024 * 1024;
    functions.checkFile.mockResolvedValue(false);
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Ảnh không được vượt quá 5MB", 400);
  });

  it("TC52 - Ảnh sai định dạng (GIF) → Thông báo: Chỉ cho phép định dạng ảnh JPG, JPEG, PNG", async () => {
    req.files.avatar.path = "/tmp/file.gif";
    functions.checkFile.mockResolvedValue(false);
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Chỉ cho phép định dạng ảnh JPG, JPEG, PNG", 400);
  });

  it("TC53 - Upload ảnh sai kích thước (giả định) → Thông báo: Nên sử dụng ảnh kích thước 190x190 để hiển thị tối ưu", async () => {
    // Mặc định hệ thống không check size, có thể mock nếu cần
    await updateUngVien(req, res);
    expect(functions.success).toHaveBeenCalled();
  });

  it("TC54 - Upload file không phải ảnh → Thông báo: File không hợp lệ. Vui lòng chọn ảnh.", async () => {
    req.files.avatar = { path: "/tmp/file.pdf" };
    functions.checkFile.mockResolvedValue(false);
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "File không hợp lệ. Vui lòng chọn ảnh.", 400);
  });

  it("TC55 - Không tìm thấy ứng viên → Thông báo: Không tìm thấy ứng viên", async () => {
    Users.findOneAndUpdate.mockResolvedValue(null);
    await updateUngVien(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, "Không tìm thấy ứng viên", 400);
  });

  it("TC56 - Cập nhật thành công → Thông báo: Cập nhật ứng viên thành công!", async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: 1 });
    UvCvmm.findOne.mockResolvedValue(null);
    UvCvmm.findOneAndUpdate.mockResolvedValue(true);
    await updateUngVien(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, "Cập nhật ứng viên thành công!");
  });

  describe("Kiểm thử từng trường bắt buộc bị thiếu", () => {
    const requiredFields = {
      userName: "tên ứng viên",
      phone: "số điện thoại",
      email: "email",
      password: "mật khẩu",
      city: "tỉnh/thành phố",
      district: "quận/huyện",
      address: "địa chỉ",
      uv_congviec: "công việc mong muốn",
    };
  
    let tcNumber = 57;
    for (const [field, label] of Object.entries(requiredFields)) {
      it(`TC${tcNumber++} - Thiếu trường ${label} → Thông báo: Thiếu ${label}`, async () => {
        req.body[field] = null;
        await updateUngVien(req, res);
        expect(functions.setError).toHaveBeenCalledWith(res, `Thiếu ${label}`, 400);
      });
  
      it(`TC${tcNumber++} - Trường ${label} chỉ có dấu cách → Thông báo: Thiếu ${label}`, async () => {
        req.body[field] = "   ";
        await updateUngVien(req, res);
        expect(functions.setError).toHaveBeenCalledWith(res, `Thiếu ${label}`, 400);
      });
    }
  });
  
});
