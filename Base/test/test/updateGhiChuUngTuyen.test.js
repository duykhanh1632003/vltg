const { updateGhiChuUngTuyen } = require("../controllers/vieclamtheogio/manageAccountCompany"); 
const functions = require("../services/functions");

const UngTuyen = require("../models/ViecLamTheoGio/UngTuyen");
const Users = require("../models/ViecLamTheoGio/Users");
const ViecLam = require("../models/ViecLamTheoGio/ViecLam");

jest.mock("../models/ViecLamTheoGio/UngTuyen");
jest.mock("../models/ViecLamTheoGio/Users");
jest.mock("../models/ViecLamTheoGio/ViecLam");
jest.mock("../services/functions");

describe("updateGhiChuUngTuyen", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        id_viec: 101,
        id_uv: 202,
        ghi_chu: "Ghi chú mới",
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
  });

  test("UDGCUT_TC01 - Cập nhật ghi chú thành công", async () => {
    UngTuyen.updateMany.mockResolvedValue({ matchedCount: 1 });

    await updateGhiChuUngTuyen(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Update ghi chu ung tuyen thanh cong");
  });

  test("UDGCUT_TC02 - Thiếu id_viec hoặc id_uv", async () => {
    req.body = {
      ghi_chu: "Ghi chú mới",
    };

    await updateGhiChuUngTuyen(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value", 405);
  });

  test("UDGCUT_TC03 - Không tìm thấy ứng tuyển", async () => {
    UngTuyen.updateMany.mockResolvedValue({ matchedCount: 0 });

    await updateGhiChuUngTuyen(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Ung tuyen not found!", 404);
  });

  test("UDGCUT_TC04 - Xử lý lỗi server", async () => {
    const error = new Error("Lỗi server");
    UngTuyen.updateMany.mockRejectedValue(error);

    await updateGhiChuUngTuyen(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, error.message);
  });

  // test("TC05 - id_viec và id_uv là chuỗi", async () => {
  //   req.body.id_viec = "101"; // kiểu chuỗi
  //   req.body.id_uv = "202"; // kiểu chuỗi

  //   UngTuyen.updateMany.mockResolvedValue({ matchedCount: 1 });

  //   await updateGhiChuUngTuyen(req, res);

  //   expect(functions.success).toHaveBeenCalledWith(res, "Update ghi chu ung tuyen thanh cong");
  // });

  // test("TC06 - Không tìm thấy ứng viên", async () => {
  //   Users.findOne.mockResolvedValue(null);

  //   await updateGhiChuUngTuyen(req, res);

  //   expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value", 405);
  // });

  // test("TC07 - Thiếu ghi_chu", async () => {
  //   req.body = {
  //     id_viec: 101,
  //     id_uv: 202,
  //   };

  //   await updateGhiChuUngTuyen(req, res);

  //   expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value", 405);
  // });
});
