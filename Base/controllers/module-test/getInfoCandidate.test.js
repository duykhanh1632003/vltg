const { getInfoCandidate } = require("../vieclamtheogio/manageAccountCandidate");
const Users = require("../../models/ViecLamTheoGio/Users");
const UvCvmm = require("../../models/ViecLamTheoGio/UvCvmm");
const City2 = require("../../models/ViecLamTheoGio/City2");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../models/ViecLamTheoGio/UvCvmm");
jest.mock("../../models/ViecLamTheoGio/City2");
jest.mock("../../models/ViecLamTheoGio/JobCategory");

jest.mock("../../services/functions", () => ({
  success: jest.fn(),
  setError: jest.fn((res, msg, code = 500) => {
    res.statusCode = code;
    res.message = msg;
    return res;
  }),
  getLinkFile: jest.fn(() => "https://mocked/avatar.jpg"),
  convertTimestamp: jest.fn(() => 1700000000),
}));

describe("getInfoCandidate", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        data: {
          _id: 1,
        },
      },
    };
    res = {};
    jest.clearAllMocks();
  });

  test("Trả về thông tin ứng viên thành công với đầy đủ dữ liệu", async () => {
    const mockUser = {
      _id: 1,
      userName: "Test User",
      email: "test@example.com",
      createdAt: null,
      avatarUser: "avatar.jpg",
    };

    const mockUvCvmm = {
      id_uv_cvmm: 1,
      nganh_nghe: "1, 2",
      dia_diem: "101, 102",
    };

    const mockJobs = [
      { jc_id: 1, jc_name: "Dev" },
      { jc_id: 2, jc_name: "Tester" },
    ];

    const mockCities = [
      { cit_id: 101, cit_name: "Hanoi" },
      { cit_id: 102, cit_name: "HCM" },
    ];

    Users.findOne.mockResolvedValue(mockUser);
    UvCvmm.findOne.mockResolvedValue(mockUvCvmm);
    JobCategory.find.mockResolvedValue(mockJobs);
    City2.find.mockResolvedValue(mockCities);

    await getInfoCandidate(req, res);

    expect(Users.findOne).toHaveBeenCalledWith(
      { _id: 1, type: 0 },
      expect.any(Object)
    );
  });

  test("Trả về lỗi khi không tìm thấy user", async () => {
    Users.findOne.mockResolvedValue(null);

    await getInfoCandidate(req, res);

  });

  test("Trả về thông tin khi không có UV CVMM", async () => {
    const mockUser = {
      _id: 1,
      userName: "Test User",
      email: "test@example.com",
      createdAt: 1700000000,
      avatarUser: "avatar.jpg",
    };

    Users.findOne.mockResolvedValue(mockUser);
    UvCvmm.findOne.mockResolvedValue(null);

    await getInfoCandidate(req, res);

  });


});
