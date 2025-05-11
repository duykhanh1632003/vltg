const { updateKetQuaNtdXemUv } = require("../controllers/vieclamtheogio/manageAccountCompany");
const functions = require("../services/functions");
const NtdXemUv = require("../models/ViecLamTheoGio/NtdXemUv");

jest.mock("../models/ViecLamTheoGio/NtdXemUv");
jest.mock("../services/functions");

describe("updateKetQuaNtdXemUv", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        stt: 1,
        ket_qua: "Passed",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    functions.success.mockClear();
    functions.setError.mockClear();
  });

  test("UDKQNTDXUV_TC01 - Cập nhật kết quả thành công", async () => {
    // Mock dữ liệu trả về từ phương thức findOneAndUpdate
    NtdXemUv.findOneAndUpdate.mockResolvedValue({ stt: 1, ket_qua: "Passed" });

    req.body = {
      stt: 1,
      ket_qua: "Passed",
    };

    await updateKetQuaNtdXemUv(req, res);

    // Kiểm tra xem hàm success có được gọi với thông điệp đúng hay không
    expect(functions.success).toHaveBeenCalledWith(
      res,
      "Update ket_qua nha tuyen dung xem ung vien thanh cong"
    );
  });

  test("UDKQNTDXUV_TC02 - Thiếu stt trong request body", async () => {
    req.body = { ket_qua: "Passed" }; // Thiếu stt

    await updateKetQuaNtdXemUv(req, res);

    // Kiểm tra xem hàm setError có được gọi với thông điệp lỗi thích hợp không
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input stt", 405);
  });

  test("UDKQNTDXUV_TC03 - Không tìm thấy bản ghi với stt", async () => {
    NtdXemUv.findOneAndUpdate.mockResolvedValue(null); // Không tìm thấy bản ghi

    req.body = { stt: 1, ket_qua: "Passed" };

    await updateKetQuaNtdXemUv(req, res);

    // Kiểm tra xem hàm setError có được gọi với thông điệp lỗi thích hợp không
    expect(functions.setError).toHaveBeenCalledWith(res, "NtdXemUv not found!", 404);
  });

  test("UDKQNTDXUV_TC04 - Xử lý lỗi server", async () => {
    const error = new Error("Lỗi cơ sở dữ liệu");
    NtdXemUv.findOneAndUpdate.mockRejectedValue(error); // Giả lập lỗi server

    req.body = { stt: 1, ket_qua: "Passed" };

    await updateKetQuaNtdXemUv(req, res);

    // Kiểm tra xem hàm setError có được gọi với thông điệp lỗi không
    expect(functions.setError).toHaveBeenCalledWith(res, error.message);
  });

  test("UDKQNTDXUV_TC05 - stt không phải là số", async () => {
    req.body = { stt: "one", ket_qua: "Passed" }; // stt không phải là số

    await updateKetQuaNtdXemUv(req, res);

    // Kiểm tra xem hàm setError có được gọi với thông điệp lỗi không
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input stt", 405);
  });

  // test("TC06 - Thiếu ket_qua trong request body", async () => {
  //   req.body = { stt: 1 }; // Thiếu ket_qua

  //   await updateKetQuaNtdXemUv(req, res);

  //   // Kiểm tra xem hàm setError có được gọi với thông điệp lỗi không
  //   expect(functions.setError).toHaveBeenCalledWith(res, "Missing input stt", 405);
  // });
});
