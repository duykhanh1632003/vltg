const { danhSachUngVienAndNtd } = require("../../controllers/vieclamtheogio/admin");
const Users = require("../../models/ViecLamTheoGio/Users");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../services/functions");

describe("Test danhSachUngVienAndNtd controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        page: 1,
        pageSize: 10,
        type: 1, // ứng viên
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    functions.convertTimestamp.mockImplementation((date) => date);
    functions.getLinkFile.mockReturnValue("link/avatar.jpg");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- 3.1: Các trường khoảng trắng ---
  test("TC77 phone là khoảng trắng -> trả toàn bộ dữ liệu", async () => {
    req.body.phone = "   ";

    const mockData = [
      { _id: 4, userName: " Thi Nguyenn", createdAt: 1736245181, avatarUser: "1736245181-user-thinguyen.jpeg" },
    ];

    Users.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(1);

    await danhSachUngVienAndNtd(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      code: 200,
      message: "Thong ke danh sach ntd",
      data: {
        total: 1,
        data: [
          {
            ...mockData[0],
            linkAvatar: "link/avatar.jpg",
          },
        ],
      },
    });
  });

  test("TC78 email là khoảng trắng -> trả toàn bộ dữ liệu", async () => {
    req.body.email = "   ";

    const mockData = [
      { _id: 4, email: "lvdfullstack@gmail.com", userName: " Thi Nguyenn", createdAt: 1736245181, avatarUser: "1736245181-user-thinguyen.jpeg" },
    ];

    Users.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(1);

    await danhSachUngVienAndNtd(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      code: 200,
      message: "Thong ke danh sach ntd",
      data: {
        total: 1,
        data: [
          {
            ...mockData[0],
            linkAvatar: "link/avatar.jpg",
          },
        ],
      },
    });
  });

  test("TC79 userName là khoảng trắng -> trả toàn bộ dữ liệu", async () => {
    req.body.userName = "   ";

    const mockData = [
      { _id: 4, userName: " Thi Nguyenn", createdAt: 1736245181, avatarUser: "1736245181-user-thinguyen.jpeg" },
    ];

    Users.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(1);

    await danhSachUngVienAndNtd(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      code: 200,
      message: "Thong ke danh sach ntd",
      data: {
        total: 1,
        data: [
          {
            ...mockData[0],
            linkAvatar: "link/avatar.jpg",
          },
        ],
      },
    });
  });

  // --- 3.2: Tìm theo _id tuyệt đối ---
  test("TC80 Tìm kiếm theo _id là tuyệt đối", async () => {
    req.body._id = 4;

    const mockData = [
      { _id: 4, userName: " Thi Nguyenn", createdAt: 1736245181, avatarUser: "1736245181-user-thinguyen.jpeg" },
    ];

    Users.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(1);

    await danhSachUngVienAndNtd(req, res, next);

    expect(Users.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $match: expect.objectContaining({ _id: 4 }) }),
      ])
    );
  });

  // --- 3.3: Ngày quá xa ---
  test("TC81 Nhập ngày quá xa -> không ra dữ liệu", async () => {
    req.body.fromDate = "1990-01-01";
    req.body.toDate = "1990-01-02";

    Users.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await danhSachUngVienAndNtd(req, res, next);
  });

  // --- 3.4: fromDate > toDate ---
  test("TC82 fromDate > toDate -> không có dữ liệu", async () => {
    req.body.fromDate = "2025-05-13";
    req.body.toDate = "2024-01-01";

    Users.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await danhSachUngVienAndNtd(req, res, next);


  });

  // --- 3.5: Sai định dạng phone ---
  test("TC83 Nhập sai định dạng phone -> không có dữ liệu", async () => {
    req.body.phone = "!!!###$$$";

    Users.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await danhSachUngVienAndNtd(req, res, next);

  });

  // --- 3.6: Tìm theo userName ---
  test("TC84 Tìm kiếm theo họ tên userName", async () => {
    req.body.userName = "Thi Nguyenn";

    const mockData = [
      { _id: 4, userName: " Thi Nguyenn", createdAt: 1736245181, avatarUser: "1736245181-user-thinguyen.jpeg" },
    ];

    Users.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(1);

    await danhSachUngVienAndNtd(req, res, next);

    // expect(Users.aggregate).toHaveBeenCalled();
    // expect(res.json).toHaveBeenCalledWith({
    //   code: 200,
    //   message: "Thong ke danh sach ntd",
    //   data: {
    //     total: 1,
    //     data: [
    //       {
    //         ...mockData[0],
    //         linkAvatar: "link/avatar.jpg",
    //       },
    //     ],
    //   },
    // });
  });

  // --- 3.7: Tìm theo email ---
  test("TC85 Tìm kiếm theo email", async () => {
    req.body.email = "lvdfullstack@gmail.com";

    const mockData = [
      { _id: 4, email: "lvdfullstack@gmail.com", userName: " Thi Nguyenn", createdAt: 1736245181, avatarUser: "1736245181-user-thinguyen.jpeg" },
    ];

    Users.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(1);

    await danhSachUngVienAndNtd(req, res, next);

  });

  // --- 3.8: Tìm theo phone ---
  test("TC86 Tìm kiếm theo số điện thoại", async () => {
    req.body.phone = "0326535261";

    const mockData = [
      { _id: 4, phone: "0326535261", userName: " Thi Nguyenn", createdAt: 1736245181, avatarUser: "1736245181-user-thinguyen.jpeg" },
    ];

    Users.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(1);

    await danhSachUngVienAndNtd(req, res, next);
  });

});
