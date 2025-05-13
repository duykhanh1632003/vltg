const { danhSachUngVienAndNtd } = require("../../controllers/vieclamtheogio/admin");
const functions = require("../../services/functions");
const Users = require("../../models/ViecLamTheoGio/Users");

jest.mock("../../services/functions");
jest.mock("../../models/ViecLamTheoGio/Users");

describe("danhSachUngVienAndNtd - Advanced Filtering", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    functions.convertTimestamp.mockImplementation(date => {
      if (!date) return undefined;
      return Math.floor(new Date(date).getTime() / 1000);
    });

    functions.getLinkFile.mockReturnValue("https://mock-avatar");
    functions.findCount.mockResolvedValue(1);
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, ...data }));
    functions.setError.mockImplementation((res, msg) => res.json({ error: msg }));
  });

  const mockUser = [{
    _id: 1,
    userName: "test",
    phone: "0123",
    email: "test@gmail.com",
    avatarUser: "avatar.png",
    createdAt: 1700000000,
    CVMM: { cong_viec: "Dev", dia_diem: "HCM", nganh_nghe: "IT" },
  }];

  const callAPI = async (body = {}) => {
    req = { body: { page: 1, pageSize: 10, ...body } };
    Users.aggregate.mockResolvedValue(mockUser);
    await danhSachUngVienAndNtd(req, res);
  };

  test("TC14 - Trả về ứng viên (type = 1)", async () => {
    await callAPI({ type: 1 });
    expect(Users.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
      { $match: expect.objectContaining({ type: 0 }) }
    ]));
  });

  test("TC15 - Trả về nhà tuyển dụng (type ≠ 1)", async () => {
    await callAPI({ type: 0 });
    expect(Users.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
      { $match: expect.objectContaining({ type: 1 }) }
    ]));
  });

  test("TC16 - Lọc theo phone", async () => {
    await callAPI({ type: 1, phone: "098" });
    const called = Users.aggregate.mock.calls[0][0][0].$match;
    expect(called.phone).toEqual(/098/i);
  });

  test("TC17 - Lọc theo email", async () => {
    await callAPI({ type: 1, email: "gmail" });
    const called = Users.aggregate.mock.calls[0][0][0].$match;
    expect(called.email).toEqual(/gmail/i);
  });

  test("TC18 - Lọc theo userName", async () => {
    await callAPI({ type: 1, userName: "linh" });
    const called = Users.aggregate.mock.calls[0][0][0].$match;
    expect(called.userName).toEqual(/linh/i);
  });

  test("TC19 - Lọc theo _id", async () => {
    await callAPI({ type: 1, _id: "123" });
    const called = Users.aggregate.mock.calls[0][0][0].$match;
    expect(called._id).toBe(123);
  });

  test("TC20 - Lọc từ ngày", async () => {
    await callAPI({ type: 1, fromDate: "2024-01-01" });
    const called = Users.aggregate.mock.calls[0][0][0].$match;
    expect(called.createdAt).toHaveProperty("$gte");
  });

  test("TC21 - Lọc đến ngày", async () => {
    await callAPI({ type: 1, toDate: "2024-12-31" });
    const called = Users.aggregate.mock.calls[0][0][0].$match;
    expect(called.createdAt).toHaveProperty("$lte");
  });

  test("TC22 - Lọc khoảng thời gian", async () => {
    await callAPI({ type: 1, fromDate: "2024-01-01", toDate: "2024-12-31" });
    const createdAt = Users.aggregate.mock.calls[0][0][0].$match.createdAt;
    expect(createdAt).toHaveProperty("$gte");
    expect(createdAt).toHaveProperty("$lte");
  });

  it("TC23 - Không có kết quả", async () => {
    Users.aggregate.mockResolvedValue([]); // Không có kết quả
    functions.findCount.mockResolvedValue(0); // Tổng = 0
  
    await callAPI({ type: 1, email: "khongtontai@gmail.com" });
  });
  

});
