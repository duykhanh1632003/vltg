const { activeTin } = require("../../controllers/vieclamtheogio/admin");
const ViecLam = require("../../models/ViecLamTheoGio/ViecLam");
const functions = require("../../services/functions");

jest.mock("../../models/ViecLamTheoGio/ViecLam");
jest.mock("../../services/functions");

describe("Hàm activeTin", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        id_vieclam: 123,
        active: 1,
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };

    functions.success = jest.fn();
    functions.setError = jest.fn();
  });

  it("TC97 nên kích hoạt công việc thành công khi truyền đúng id_vieclam và active", async () => {
    ViecLam.findOneAndUpdate.mockResolvedValue({ id_vieclam: 123, active: 1 });

    await activeTin(req, res);

    expect(ViecLam.findOneAndUpdate).toHaveBeenCalledWith(
      { id_vieclam: 123 },
      { active: 1 }
    );
    expect(functions.success).toHaveBeenCalledWith(res, "Active work success!");
  });

  it("TC98 nên trả lỗi khi thiếu id_vieclam trong request", async () => {
    req.body.id_vieclam = undefined;

    await activeTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input id_vieclam", 400);
  });

  it("TC99 nên trả lỗi khi không tìm thấy công việc", async () => {
    ViecLam.findOneAndUpdate.mockResolvedValue(null);

    await activeTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Job not found!", 404);
  });

  it("TC100nên đặt mặc định active = 0 nếu không được truyền từ client", async () => {
    req.body.active = undefined;
    ViecLam.findOneAndUpdate.mockResolvedValue({ id_vieclam: 123, active: 0 });

    await activeTin(req, res);

    expect(ViecLam.findOneAndUpdate).toHaveBeenCalledWith(
      { id_vieclam: 123 },
      { active: 0 }
    );
    expect(functions.success).toHaveBeenCalledWith(res, "Active work success!");
  });

  it("TC101 nên xử lý lỗi khi gặp exception trong quá trình cập nhật", async () => {
    ViecLam.findOneAndUpdate.mockRejectedValue(new Error("Database error"));

    await activeTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Database error");
  });
});
