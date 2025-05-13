// File: controllers/__tests__/getDetailUngVien.test.js

const { getDetailUngVien } = require("../../controllers/vieclamtheogio/admin");
const Users = require("../../models/ViecLamTheoGio/Users");
const UvCvmm = require("../../models/ViecLamTheoGio/UvCvmm");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");
const City2 = require("../../models/ViecLamTheoGio/City2");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../models/ViecLamTheoGio/UvCvmm");
jest.mock("../../models/ViecLamTheoGio/JobCategory");
jest.mock("../../models/ViecLamTheoGio/City2");
jest.mock("../../services/functions");

describe("getDetailUngVien", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { _id: 1 } };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("TC24 trả về thông tin ứng viên cùng dữ liệu CVMM đầy đủ", async () => {
    const mockUser = {
      _id: 1,
      userName: "test",
      email: "test@gmail.com",
      avatarUser: "avatar.png",
      createdAt: 1700000000,
    };

    const mockCvmm = {
      id_uv_cvmm: 1,
      cong_viec: "Dev",
      nganh_nghe: "1, 2",
      dia_diem: "10, 20",
    };

    Users.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockUser) });
    UvCvmm.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCvmm) });
    JobCategory.find.mockResolvedValue([
      { jc_id: "1", jc_name: "IT" },
      { jc_id: "2", jc_name: "Marketing" },
    ]);
    City2.find.mockResolvedValue([
      { cit_id: "10", cit_name: "HCM" },
      { cit_id: "20", cit_name: "HN" },
    ]);
    functions.getLinkFile.mockReturnValue("https://mock-avatar");
    functions.success = jest.fn();

    await getDetailUngVien(req, res, next);

    expect(functions.success).toHaveBeenCalledWith(res, "lay ra thong tin thanh cong!", {
      data: expect.objectContaining({
        _id: 1,
        linkAvatar: "https://mock-avatar",
        uv_congviec: "Dev",
      }),
      uvCvmm: expect.objectContaining({
        cong_viec: "Dev",
        name_job: expect.any(Array),
        name_city: expect.any(Array),
      }),
    });
  });

  it("TC25 trả về dữ liệu nếu CVMM bị null", async () => {
    const mockUser = { _id: 1, userName: "test", avatarUser: "avatar.png", createdAt: 1700000000 };

    Users.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockUser) });
    UvCvmm.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    functions.getLinkFile.mockReturnValue("https://mock-avatar");
    functions.success = jest.fn();

    await getDetailUngVien(req, res, next);

    expect(functions.success).toHaveBeenCalledWith(res, "lay ra thong tin thanh cong!", {
      data: expect.objectContaining({
        _id: 1,
        linkAvatar: "https://mock-avatar",
      }),
      uvCvmm: null,
    });
  });

  it("TC26 xử lý trường hợp nganh_nghe và dia_diem là null", async () => {
    const mockUser = { _id: 1, userName: "test", avatarUser: "avatar.png", createdAt: 1700000000 };
    const mockCvmm = { id_uv_cvmm: 1, cong_viec: "Tester", nganh_nghe: null, dia_diem: null };

    Users.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockUser) });
    UvCvmm.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCvmm) });
    JobCategory.find.mockResolvedValue([]);
    City2.find.mockResolvedValue([]);
    functions.getLinkFile.mockReturnValue("https://mock-avatar");
    functions.success = jest.fn();

    await getDetailUngVien(req, res, next);

    expect(functions.success).toHaveBeenCalledWith(res, "lay ra thong tin thanh cong!", {
      data: expect.objectContaining({
        _id: 1,
        uv_congviec: "Tester",
      }),
      uvCvmm: expect.objectContaining({
        name_job: [],
        name_city: [],
      }),
    });
  });

  it("TC27 trả về lỗi 404 nếu không tìm thấy người dùng", async () => {
    Users.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    functions.setError = jest.fn();

    await getDetailUngVien(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, "Ung vien not found!", 404);
  });

  it("TC28 trả về lỗi nếu có exception xảy ra", async () => {
    Users.findOne.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error("Lỗi hệ thống")) });
    functions.setError = jest.fn();

    await getDetailUngVien(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, "Lỗi hệ thống");
  });
});
