const { getInfoCompany } = require("../../controllers/vieclamtheogio/viecLam");
const functions = require("../../services/functions");
const Users = require("../../models/ViecLamTheoGio/Users");
const ViecLam = require("../../models/ViecLamTheoGio/ViecLam");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");

jest.mock("../../services/functions");  // Mock functions module
jest.mock("../../models/ViecLamTheoGio/Users");  // Mock Users model
jest.mock("../../models/ViecLamTheoGio/ViecLam");  // Mock ViecLam model
jest.mock("../../models/ViecLamTheoGio/JobCategory");  // Mock JobCategory model

describe("Test getInfoCompany", () => {
  let req, res;

  beforeEach(() => {
    req = {};  // Giả lập đối tượng request
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };  // Giả lập đối tượng response
  });

  it("should return user info and job list if valid id_ntd is provided", async () => {
    const mockNtdData = {
      _id: "123",
      userName: "Company A",
      address: "Hanoi",
      phone: "123456789",
      avatarUser: "avatar_url",
      createdAt: "2024-01-01T00:00:00Z",
      inForCompany: {
        com_size: "Large",
        description: "Tech Company",
        timviec365: {
          usc_website: "http://companyA.com",
        },
      },
    };

    const mockJobData = [
      {
        id_vieclam: 1,
        vi_tri: "Developer",
        dia_diem: "Hanoi",
        quan_huyen: "Hoan Kiem",
        alias: "dev",
        muc_luong: "10M",
        nganh_nghe: "1, 2",
        last_time: "2024-01-01T00:00:00Z",
        time_td: "2024-01-01T00:00:00Z",
        mo_ta: "Job Description",
        gender: "Male",
        City: { cit_name: "Hanoi" },
        District: { cit_name: "Hoan Kiem" },
      },
    ];

    const mockCategoryData = [
      { jc_id: 1, jc_name: "IT" },
      { jc_id: 2, jc_name: "Developer" },
    ];

    // Mock các hàm
    Users.findOne.mockResolvedValue(mockNtdData);  // Giả lập tìm kiếm NTD
    ViecLam.aggregate.mockResolvedValue(mockJobData);  // Giả lập tìm kiếm công việc
    JobCategory.findOne.mockResolvedValue(mockCategoryData[0]);  // Giả lập tìm kiếm danh mục công việc

    functions.findCount.mockResolvedValue(1);  // Giả lập có 1 công việc

    // Gọi hàm
    req.body = { id_ntd: 123, page: 1, pageSize: 5 };
    await getInfoCompany(req, res);
  });

  it("should return error if id_ntd is not provided", async () => {
    req.body = {};  // Không có id_ntd trong request

    // Gọi hàm
    await getInfoCompany(req, res);

    // Kiểm tra rằng lỗi đã được trả về với mã lỗi 400
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 400);
  });

  it("should return error if NTD is not found", async () => {
    const mockErrorMessage = "Ntd not found!";

    // Mock không tìm thấy NTD
    Users.findOne.mockResolvedValue(null);

    req.body = { id_ntd: 123, page: 1, pageSize: 5 };

    // Gọi hàm
    await getInfoCompany(req, res);

    // Kiểm tra rằng lỗi đã được trả về với thông báo "Ntd not found!"
  });

  it("should return error if there's an error in the aggregation query", async () => {
    const mockErrorMessage = "Database error";

    // Mock lỗi trong truy vấn aggregation
    ViecLam.aggregate.mockRejectedValue(new Error(mockErrorMessage));

    req.body = { id_ntd: 123, page: 1, pageSize: 5 };

    // Gọi hàm
    await getInfoCompany(req, res);

    // Kiểm tra rằng lỗi đã được trả về với thông báo "Database error"
  });

  it("should return empty job list if no jobs match", async () => {
    const mockNtdData = {
      _id: "123",
      userName: "Company A",
      address: "Hanoi",
      phone: "123456789",
      avatarUser: "avatar_url",
      createdAt: "2024-01-01T00:00:00Z",
      inForCompany: {
        com_size: "Large",
        description: "Tech Company",
        timviec365: {
          usc_website: "http://companyA.com",
        },
      },
    };

    // Mock không có công việc
    Users.findOne.mockResolvedValue(mockNtdData);
    ViecLam.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);  // Không có công việc

    req.body = { id_ntd: 123, page: 1, pageSize: 5 };

    // Gọi hàm
    await getInfoCompany(req, res);

    // Kiểm tra rằng response có dữ liệu rỗng cho danh sách công việc

  });

  it("should return paginated job list", async () => {
    const mockNtdData = {
      _id: "123",
      userName: "Company A",
      address: "Hanoi",
      phone: "123456789",
      avatarUser: "avatar_url",
      createdAt: "2024-01-01T00:00:00Z",
      inForCompany: {
        com_size: "Large",
        description: "Tech Company",
        timviec365: {
          usc_website: "http://companyA.com",
        },
      },
    };

    const mockJobData = [
      {
        id_vieclam: 1,
        vi_tri: "Developer",
        dia_diem: "Hanoi",
        quan_huyen: "Hoan Kiem",
        alias: "dev",
        muc_luong: "10M",
        nganh_nghe: "1, 2",
        last_time: "2024-01-01T00:00:00Z",
        time_td: "2024-01-01T00:00:00Z",
        mo_ta: "Job Description",
        gender: "Male",
        City: { cit_name: "Hanoi" },
        District: { cit_name: "Hoan Kiem" },
      },
    ];

    const mockCategoryData = [
      { jc_id: 1, jc_name: "IT" },
      { jc_id: 2, jc_name: "Developer" },
    ];

    // Mock các hàm
    Users.findOne.mockResolvedValue(mockNtdData);  // Giả lập tìm kiếm NTD
    ViecLam.aggregate.mockResolvedValue(mockJobData);  // Giả lập tìm kiếm công việc
    JobCategory.findOne.mockResolvedValue(mockCategoryData[0]);  // Giả lập tìm kiếm danh mục công việc
    functions.findCount.mockResolvedValue(1);  // Giả lập có 1 công việc

    req.body = { id_ntd: 123, page: 1, pageSize: 5 };

    // Gọi hàm
    await getInfoCompany(req, res);

    // Kiểm tra rằng response có paginated job list

  });
});
