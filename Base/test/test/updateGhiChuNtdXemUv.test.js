// const { updateGhiChuNtdXemUv } = require("../controllers/vieclamtheogio/manageAccountCompany");
// const NtdXemUv = require("../models/ViecLamTheoGio/NtdXemUv");
// const functions = require("../services/functions");

// jest.mock("../models/ViecLamTheoGio/NtdXemUv");
// jest.mock("../services/functions");

// describe("updateGhiChuNtdXemUv", () => {
//   let req, res;

//   beforeEach(() => {
//     req = {
//       body: {
//         stt: 1,
//         ghi_chu: "Test ghi chú"
//       }
//     };

//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };

//     jest.clearAllMocks();
//   });

//   test("TC01 - Cập nhật ghi chú thành công", async () => {
//     NtdXemUv.findOneAndUpdate.mockResolvedValue({ stt: 1 });

//     await updateGhiChuNtdXemUv(req, res);

//     expect(functions.success).toHaveBeenCalledWith(
//       res,
//       "Update chi chu nha tuyen dung xem ung vien thanh cong"
//     );
//   });

//   test("TC02 - Thiếu stt trong body", async () => {
//     req.body = { ghi_chu: "Ghi chú mới" };

//     await updateGhiChuNtdXemUv(req, res);

//     expect(functions.setError).toHaveBeenCalledWith(res, "Missing input stt", 405);
//   });

//   test("TC03 - Không tìm thấy bản ghi", async () => {
//     NtdXemUv.findOneAndUpdate.mockResolvedValue(null);

//     await updateGhiChuNtdXemUv(req, res);

//     expect(functions.setError).toHaveBeenCalledWith(res, "NtdXemUv not found!", 404);
//   });

//   test("TC04 - Lỗi từ findOneAndUpdate", async () => {
//     const error = new Error("Lỗi DB");
//     NtdXemUv.findOneAndUpdate.mockRejectedValue(error);

//     await updateGhiChuNtdXemUv(req, res);

//     expect(functions.setError).toHaveBeenCalledWith(res, error.message);
//   });

//   test("TC05 - stt là chuỗi không hợp lệ", async () => {
//     req.body.stt = "abc";
//     NtdXemUv.findOneAndUpdate.mockResolvedValue(null); // Không tìm thấy vì stt = NaN

//     await updateGhiChuNtdXemUv(req, res);

//     expect(functions.setError).toHaveBeenCalledWith(res, "NtdXemUv not found!", 404);
//   });

//   test("TC06 - ghi_chu là chuỗi rỗng", async () => {
//     req.body.ghi_chu = "";
//     NtdXemUv.findOneAndUpdate.mockResolvedValue({ stt: 1 });

//     await updateGhiChuNtdXemUv(req, res);

//     expect(functions.success).toHaveBeenCalledWith(
//       res,
//       "Update chi chu nha tuyen dung xem ung vien thanh cong"
//     );
//   });
// });

const { updateGhiChuNtdXemUv } = require("../controllers/vieclamtheogio/manageAccountCompany");
const functions = require("../services/functions");
const NtdXemUv = require("../models/ViecLamTheoGio/NtdXemUv");

jest.mock("../models/ViecLamTheoGio/NtdXemUv");
jest.mock("../services/functions");

describe("updateGhiChuNtdXemUv", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        stt: 1,
        ghi_chu: "Ghi chú mới",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    functions.success.mockClear();
    functions.setError.mockClear();
  });

  // Test Case 1: Thành công khi cập nhật ghi chú
  test("UDGCNTDXUV_TC01 - Cập nhật ghi chú thành công", async () => {
    NtdXemUv.findOneAndUpdate.mockResolvedValue({ stt: 1, ghi_chu: "Ghi chú mới" });

    await updateGhiChuNtdXemUv(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "Update chi chu nha tuyen dung xem ung vien thanh cong");
  });

  // Test Case 2: Thiếu stt trong request body
  test("UDGCNTDXUV_TC02 - Thiếu stt trong request body", async () => {
    req.body = { ghi_chu: "Ghi chú mới" }; // Thiếu stt

    await updateGhiChuNtdXemUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input stt", 405);
  });

  // Test Case 3: Không tìm thấy bản ghi với stt
  test("UDGCNTDXUV_TC03 - Không tìm thấy bản ghi với stt", async () => {
    NtdXemUv.findOneAndUpdate.mockResolvedValue(null); // Không tìm thấy bản ghi

    await updateGhiChuNtdXemUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "NtdXemUv not found!", 404);
  });

  // Test Case 4: Xử lý lỗi server
  test("UDGCNTDXUV_TC04 - Xử lý lỗi server", async () => {
    const error = new Error("Lỗi server");
    NtdXemUv.findOneAndUpdate.mockRejectedValue(error); // Giả lập lỗi trong quá trình thực thi

    await updateGhiChuNtdXemUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, error.message);
  });

  // Test Case 5: stt không phải là số
  // test("TC05 - stt không phải là số", async () => {
  //   req.body = { stt: "one", ghi_chu: "Ghi chú mới" }; // stt là chuỗi không phải số
  //   NtdXemUv.findOneAndUpdate.mockResolvedValue(null);

  //   await updateGhiChuNtdXemUv(req, res);

  //   expect(functions.setError).toHaveBeenCalledWith(res, "NtdXemUv not found!", 404);
  // });

  // Test Case 6: Thiếu ghi_chu trong request body
  // test("TC06 - Thiếu ghi_chu trong request body", async () => {
  //   req.body = { stt: 1 }; // Thiếu ghi_chu

  //   await updateGhiChuNtdXemUv(req, res);

  //   expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value", 405);
  // });

  // Test Case 7: Xử lý khi có lỗi trong findOneAndUpdate
  test("UDGCNTDXUV_TC07 - Xử lý khi có lỗi trong findOneAndUpdate", async () => {
    const errorMessage = "Database error";
    NtdXemUv.findOneAndUpdate.mockRejectedValue(new Error(errorMessage)); // Giả lập lỗi

    await updateGhiChuNtdXemUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, errorMessage);
  });
});

