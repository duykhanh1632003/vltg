const { updateCongViecMongMuon } = require("./manageAccountCandidate");

const Users = require("../../models/ViecLamTheoGio/Users");
const UvCvmm = require("../../models/ViecLamTheoGio/UvCvmm");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../models/ViecLamTheoGio/UvCvmm");
jest.mock("../../services/functions");

describe("Unit test: updateCongViecMongMuon conditions", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 123 } },
      body: {
        cong_viec: "Dev",
        nganh_nghe: ["IT"],
        dia_diem: ["HN"],
        cap_bac: 1,
        hinh_thuc: 2,
        luong: 1000,
      },
    };
    res = {};
  });

  it("✅ Nên trả về success nếu uvCvmm tồn tại", async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: 123 });
    UvCvmm.findOneAndUpdate.mockResolvedValue({ cong_viec: "Dev" });

    await updateCongViecMongMuon(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      "Update cvmm success!",
      { uvCvmm: { cong_viec: "Dev" } }
    );
  });

  it("❌ Nên trả về lỗi 406 nếu không có uvCvmm", async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: 123 });
    UvCvmm.findOneAndUpdate.mockResolvedValue(null);

    await updateCongViecMongMuon(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Update cvmm fail!", 406);
  });

  it("❌ Nên trả về lỗi 404 nếu không có user", async () => {
    Users.findOneAndUpdate.mockResolvedValue(null);

    await updateCongViecMongMuon(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "user not found!", 404);
  });

  it("❌ Nên trả về lỗi 405 nếu thiếu input", async () => {
    req.body = { cong_viec: "Dev", nganh_nghe: [], dia_diem: [] };

    await updateCongViecMongMuon(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value!", 405);
  });

  it("❌ Nên trả về lỗi nếu có exception", async () => {
    Users.findOneAndUpdate.mockImplementation(() => {
      throw new Error("DB error");
    });

    await updateCongViecMongMuon(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "DB error");
  });
});
