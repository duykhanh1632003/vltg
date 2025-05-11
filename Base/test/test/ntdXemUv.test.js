// Import hàm cần test
const { ntdXemUv } = require("../controllers/vieclamtheogio/manageAccountCompany");

// Mock các model và hàm phụ trợ
const Users = require("../models/ViecLamTheoGio/Users");
const NtdXemUv = require("../models/ViecLamTheoGio/NtdXemUv");
const ThongBaoUv = require("../models/ViecLamTheoGio/ThongBaoUv");
const functions = require("../services/functions");

jest.mock("../models/ViecLamTheoGio/Users");
jest.mock("../models/ViecLamTheoGio/NtdXemUv");
jest.mock("../models/ViecLamTheoGio/ThongBaoUv");
jest.mock("../services/functions");

describe("Kiểm tra hàm ntdXemUv", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 1 } },
      body: { id_uv: 2 },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("Trả lỗi nếu không tìm thấy nhà tuyển dụng", async () => {
    Users.findOne.mockResolvedValueOnce(null);

    await ntdXemUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(
      res,
      "Nha tuyen dung not found or missing input id_uv!",
      404
    );
  });

  it("Trả lỗi nếu thiếu id ứng viên", async () => {
    req.body.id_uv = null;
    Users.findOne.mockResolvedValueOnce({ _id: 1, type: 1 });

    await ntdXemUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(
      res,
      "Nha tuyen dung not found or missing input id_uv!",
      404
    );
  });

  it("Trả lỗi nếu không tìm thấy ứng viên", async () => {
    Users.findOne
      .mockResolvedValueOnce({ _id: 1, type: 1 }) // Nhà tuyển dụng
      .mockResolvedValueOnce(null); // Không có ứng viên

    await ntdXemUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Ung vien not found!", 404);
  });

  it("Trả lỗi nếu đã xem ứng viên trước đó", async () => {
    Users.findOne
      .mockResolvedValueOnce({ _id: 1, type: 1 })
      .mockResolvedValueOnce({ _id: 2, type: 0 });

    NtdXemUv.findOne.mockResolvedValueOnce({ id_ntd: 1, id_uv: 2 });

    await ntdXemUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(
      res,
      "Nha tuyen dung da xem tt cua ung vien!"
    );
  });

  it("Trả lỗi nếu nhà tuyển dụng không đủ điểm", async () => {
    Users.findOne
      .mockResolvedValueOnce({ _id: 1, type: 1, diem_free: 0, diem_mua: 0 })
      .mockResolvedValueOnce({ _id: 2, type: 0 });

    NtdXemUv.findOne.mockResolvedValueOnce(null);

    await ntdXemUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Nha tuyen dung khong du diem!", 400);
  });

  it("Trả lỗi nếu lưu thông tin xem thất bại", async () => {
    const ntd = { _id: 1, type: 1, diem_free: 1, diem_mua: 0, userName: "NTD", avatarUser: "avatar.png" };
    const uv = { _id: 2, type: 0, userName: "UV", email: "uv@gmail.com" };

    Users.findOne
      .mockResolvedValueOnce(ntd)
      .mockResolvedValueOnce(uv);

    NtdXemUv.findOne.mockResolvedValueOnce(null);
    functions.convertTimestamp.mockReturnValue(123456);
    functions.getMaxIdByField.mockResolvedValueOnce(1).mockResolvedValueOnce(2);

    Users.findOneAndUpdate.mockResolvedValueOnce({ diem_free: 0 });

    const saveMock = jest.fn().mockResolvedValueOnce(null);
    NtdXemUv.mockImplementation(() => ({ save: saveMock }));

    await ntdXemUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(
      res,
      "Nha tuyen dung xem ung vien that bai!",
      500
    );
  });

  it("Xem ứng viên thành công (dùng điểm miễn phí)", async () => {
    const ntd = { _id: 1, type: 1, diem_free: 1, diem_mua: 0, userName: "NTD", avatarUser: "avatar.png" };
    const uv = { _id: 2, type: 0, userName: "UV", email: "uv@gmail.com" };

    Users.findOne.mockResolvedValueOnce(ntd).mockResolvedValueOnce(uv);
    NtdXemUv.findOne.mockResolvedValueOnce(null);

    functions.convertTimestamp.mockReturnValue(123456);
    functions.getMaxIdByField.mockResolvedValueOnce(1).mockResolvedValueOnce(2);

    Users.findOneAndUpdate.mockResolvedValueOnce({ diem_free: 0 });

    const saveXem = jest.fn().mockResolvedValueOnce({ stt: 1 });
    NtdXemUv.mockImplementation(() => ({ save: saveXem }));

    const saveThongBao = jest.fn().mockResolvedValueOnce(true);
    ThongBaoUv.mockImplementation(() => ({ save: saveThongBao }));

    functions.sendEmailUv.mockResolvedValueOnce(true);

    await ntdXemUv(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      "Nha tuyen dung xem ung vien thanh cong!"
    );
  });

  it("Xem ứng viên thành công (dùng điểm đã mua)", async () => {
    const ntd = { _id: 1, type: 1, diem_free: 0, diem_mua: 1, userName: "NTD", avatarUser: "avatar.png" };
    const uv = { _id: 2, type: 0, userName: "UV", email: "uv@gmail.com" };

    Users.findOne.mockResolvedValueOnce(ntd).mockResolvedValueOnce(uv);
    NtdXemUv.findOne.mockResolvedValueOnce(null);

    functions.convertTimestamp.mockReturnValue(123456);
    functions.getMaxIdByField.mockResolvedValueOnce(1).mockResolvedValueOnce(2);

    Users.findOneAndUpdate.mockResolvedValueOnce({ diem_mua: 0 });

    const saveXem = jest.fn().mockResolvedValueOnce({ stt: 1 });
    NtdXemUv.mockImplementation(() => ({ save: saveXem }));

    const saveThongBao = jest.fn().mockResolvedValueOnce(true);
    ThongBaoUv.mockImplementation(() => ({ save: saveThongBao }));

    functions.sendEmailUv.mockResolvedValueOnce(true);

    await ntdXemUv(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      "Nha tuyen dung xem ung vien thanh cong!"
    );
  });

  it("Xử lý lỗi hệ thống (bất ngờ)", async () => {
    Users.findOne.mockImplementation(() => {
      throw new Error("Lỗi hệ thống");
    });

    await ntdXemUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Lỗi hệ thống");
  });
});
