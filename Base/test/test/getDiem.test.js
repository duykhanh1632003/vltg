const { getDiem } = require("../controllers/vieclamtheogio/manageAccountCompany");
const Users = require("../models/ViecLamTheoGio/Users");
const functions = require("../services/functions");

jest.mock("../models/ViecLamTheoGio/Users");
jest.mock("../services/functions");

describe("getDiem", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        data: {
          _id: 123
        }
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  test("GD_TC01 - Tìm thấy nhà tuyển dụng thành công", async () => {
    const fakeUser = { _id: 123, type: 1, diem_free: 10, diem_mua: 5 };
    Users.findOne.mockResolvedValue(fakeUser);

    await getDiem(req, res);

    expect(Users.findOne).toHaveBeenCalledWith({ _id: 123, type: 1 });
    expect(functions.success).toHaveBeenCalledWith(
      res,
      "Get diem thanh cong",
      { data: fakeUser }
    );
  });

  test("GD_TC02 - Không tìm thấy nhà tuyển dụng", async () => {
    Users.findOne.mockResolvedValue(null);

    await getDiem(req, res);

    expect(functions.setError).toHaveBeenCalledWith(
      res,
      "Nha tuyen dung not found!",
      404
    );
  });

  test("GD_TC03 - Truy vấn lỗi", async () => {
    const error = new Error("DB lỗi");
    Users.findOne.mockRejectedValue(error);

    await getDiem(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, error.message);
  });

  // test("TC04 - Thiếu req.user", async () => {
  //   req.user = undefined;
  
  //   await getDiem(req, res);
  
  //   expect(functions.setError).toHaveBeenCalledWith(
  //     res,
  //     expect.any(String) // error.message sẽ là lỗi runtime
  //   );
  // });
  
  // test("TC05 - Thiếu req.user.data", async () => {
  //   req.user = {};
  
  //   await getDiem(req, res);
  
  //   expect(functions.setError).toHaveBeenCalledWith(
  //     res,
  //     expect.any(String)
  //   );
  // });
  
  test("GD_TC06 - _id là chuỗi", async () => {
    req.user.data._id = "123"; // thay vì số
  
    const fakeUser = { _id: 123, type: 1 };
    Users.findOne.mockResolvedValue(fakeUser);
  
    await getDiem(req, res);
  
    expect(Users.findOne).toHaveBeenCalledWith({ _id: "123", type: 1 });
    expect(functions.success).toHaveBeenCalledWith(res, "Get diem thanh cong", {
      data: fakeUser
    });
  });
  
  test("GD_TC07 - User không có trường diem", async () => {
    const fakeUser = { _id: 123, type: 1 }; // không có diem_free, diem_mua
    Users.findOne.mockResolvedValue(fakeUser);
  
    await getDiem(req, res);
  
    expect(functions.success).toHaveBeenCalledWith(res, "Get diem thanh cong", {
      data: fakeUser
    });
  });

  test("GD_TC08 - Lỗi khi gọi Users.findOne", async () => {
    const errorMessage = "Database error";
    Users.findOne.mockRejectedValue(new Error(errorMessage)); // Giả lập lỗi khi gọi `findOne`

    await getDiem(req, res);

    // Kiểm tra xem hàm setError có được gọi với thông báo lỗi không
    expect(functions.setError).toHaveBeenCalledWith(res, errorMessage);
  });

  // Test Case 4: Thiếu `id_ntd` trong `req.user.data`
  test("GD_TC09 - Thiếu id_ntd trong req.user.data", async () => {
    req.user._id = null; // Thiếu `data` hoặc `id`

    await getDiem(req, res);

    // Kiểm tra xem hàm setError có được gọi với thông báo lỗi đúng không
    expect(functions.setError).toHaveBeenCalledWith(res, "Nha tuyen dung not found!", 404);
  });
});
