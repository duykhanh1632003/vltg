const { updateStatusUngTuyen } = require("../controllers/vieclamtheogio/manageAccountCompany"); // đổi path đúng
const functions = require("../services/functions");

const UngTuyen = require("../models/ViecLamTheoGio/UngTuyen");
const Users = require("../models/ViecLamTheoGio/Users");
const ViecLam = require("../models/ViecLamTheoGio/ViecLam");

jest.mock("../models/ViecLamTheoGio/UngTuyen");
jest.mock("../models/ViecLamTheoGio/Users");
jest.mock("../models/ViecLamTheoGio/ViecLam");
jest.mock("../services/functions");

describe("updateStatusUngTuyen", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        id_viec: 101,
        id_uv: 202,
        status: 3,
      },
      user: {
        data: {
          _id: 999,
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    functions.success.mockClear();
    functions.setError.mockClear();
    functions.sendEmailUvChuaPhuHop.mockClear();
    functions.sendEmailUvPhuHop.mockClear();
  });

  test("UDSUV_TC01 - Status = 3 (Không phù hợp) => Gửi mail loại", async () => {
    UngTuyen.updateMany.mockResolvedValue({ matchedCount: 1 });
    Users.findOne
      .mockResolvedValueOnce({ email: "ntd@gmail.com" }) // NTD
      .mockResolvedValueOnce({ email: "uv@gmail.com" }); // UV
    ViecLam.findOne.mockResolvedValue({ vi_tri: "Tester" });

    await updateStatusUngTuyen(req, res);

    expect(functions.sendEmailUvChuaPhuHop).toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalledWith(res, expect.stringContaining("thanh cong"));
  });

  test("UDSUV_TC02 - Status = 2 (Phù hợp) => Gửi mail phù hợp", async () => {
    req.body.status = 2;

    UngTuyen.updateMany.mockResolvedValue({ matchedCount: 1 });
    Users.findOne
      .mockResolvedValueOnce({ email: "ntd@gmail.com" })
      .mockResolvedValueOnce({ email: "uv@gmail.com" });
    ViecLam.findOne.mockResolvedValue({ vi_tri: "Developer" });

    await updateStatusUngTuyen(req, res);

    expect(functions.sendEmailUvPhuHop).toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalled();
  });

  test("UDSUV_TC03 - Status khác (VD: 1) => Không gửi mail", async () => {
    req.body.status = 1;
    UngTuyen.updateMany.mockResolvedValue({ matchedCount: 1 });
    Users.findOne.mockResolvedValue({}); ViecLam.findOne.mockResolvedValue({});

    await updateStatusUngTuyen(req, res);

    expect(functions.sendEmailUvChuaPhuHop).not.toHaveBeenCalled();
    expect(functions.sendEmailUvPhuHop).not.toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalled();
  });

  test("UDSUV_TC04 - Status = 0 => Không gửi mail", async () => {
    req.body.status = 0;
    UngTuyen.updateMany.mockResolvedValue({ matchedCount: 1 });
    Users.findOne.mockResolvedValue({}); ViecLam.findOne.mockResolvedValue({});

    await updateStatusUngTuyen(req, res);

    expect(functions.sendEmailUvChuaPhuHop).not.toHaveBeenCalled();
    expect(functions.sendEmailUvPhuHop).not.toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalled();
  });

  test("UDSUV_TC05 - Thiếu id_uv => Trả lỗi 405", async () => {
    req.body.id_uv = null;

    await updateStatusUngTuyen(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value", 405);
  });

  test("UDSUV_TC06 - Không tìm thấy đơn ứng tuyển (matchedCount = 0) => Trả lỗi 404", async () => {
    UngTuyen.updateMany.mockResolvedValue({ matchedCount: 0 });

    await updateStatusUngTuyen(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Ung tuyen not found!", 404);
  });

  test("UDSUV_TC07 - Kiểu dữ liệu sai (id_viec là chuỗi) => vẫn cập nhật bình thường", async () => {
    req.body.id_viec = "101"; // kiểu chuỗi

    UngTuyen.updateMany.mockResolvedValue({ matchedCount: 1 });
    Users.findOne.mockResolvedValue({}); ViecLam.findOne.mockResolvedValue({});

    await updateStatusUngTuyen(req, res);

    expect(functions.success).toHaveBeenCalled();
  });

  test("UDSUV_TC08 - Exception xảy ra => Trả lỗi 500", async () => {
    const error = new Error("Lỗi server");
    UngTuyen.updateMany.mockRejectedValue(error);

    await updateStatusUngTuyen(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Lỗi server");
  });
});
