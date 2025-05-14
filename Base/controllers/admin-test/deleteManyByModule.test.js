const { deleteManyByModule } = require("../../controllers/vieclamtheogio/admin");
const functions = require("../../services/functions");

const Users = require("../../models/ViecLamTheoGio/Users");
const UvCvmm = require("../../models/ViecLamTheoGio/UvCvmm");
const ViecLam = require("../../models/ViecLamTheoGio/ViecLam");
const CaLamViec = require("../../models/ViecLamTheoGio/CaLamViec");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");
const City2 = require("../../models/ViecLamTheoGio/City2");

jest.mock("../../services/functions");
jest.mock("../../models/ViecLamTheoGio/Users");
jest.mock("../../models/ViecLamTheoGio/UvCvmm");
jest.mock("../../models/ViecLamTheoGio/ViecLam");
jest.mock("../../models/ViecLamTheoGio/CaLamViec");
jest.mock("../../models/ViecLamTheoGio/JobCategory");
jest.mock("../../models/ViecLamTheoGio/City2");

describe("deleteManyByModule", () => {
    let req, res;
  
    beforeEach(() => {
      req = { body: {} };
      res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      jest.clearAllMocks();
      functions.setError = jest.fn();
      functions.success = jest.fn();
    });
  
    const setReq = (moduleId, arrId) => {
      req.body.moduleId = moduleId;
      req.body.arrId = arrId;
    };
  
    // TC87: Xóa nhiều nhà tuyển dụng thành công (moduleId = 96)
    it("TC87 - ✅ Xóa nhiều nhà tuyển dụng (moduleId = 96)", async () => {
      setReq(96, [1, 2, 3]);
      await deleteManyByModule(req, res);
      expect(Users.deleteMany).toHaveBeenCalledWith({ _id: { $in: [1, 2, 3] } });
      expect(functions.success).toHaveBeenCalledWith(res, "xóa thành công!");
    });
  
    // TC88: Xóa nhiều ứng viên + UV_CVMM thành công (moduleId = 95)
    it("TC88 - ✅ Xóa nhiều ứng viên + UV_CVMM (moduleId = 95)", async () => {
      setReq(95, [4, 5]);
      await deleteManyByModule(req, res);
      expect(Users.deleteMany).toHaveBeenCalledWith({ _id: { $in: [4, 5] } });
      expect(UvCvmm.deleteMany).toHaveBeenCalledWith({ id_uv_cvmm: { $in: [4, 5] } });
      expect(functions.success).toHaveBeenCalledWith(res, "xóa thành công!");
    });
  
    // TC89: Xóa nhiều tin tuyển dụng thành công (moduleId = 97)
    it("TC89 - ✅ Xóa nhiều tin tuyển dụng (moduleId = 97)", async () => {
      setReq(97, [6]);
      await deleteManyByModule(req, res);
      expect(ViecLam.deleteMany).toHaveBeenCalledWith({ id_vieclam: { $in: [6] } });
      expect(CaLamViec.deleteMany).toHaveBeenCalledWith({ ca_id_viec: { $in: [6] } });
      expect(functions.success).toHaveBeenCalledWith(res, "xóa thành công!");
    });
  
    // TC90: Xóa ngành nghề hoặc tag thành công (moduleId = 94)
    it("TC90 - ✅ Xóa tag hoặc ngành nghề (moduleId = 94)", async () => {
      setReq(94, [7, 8]);
      await deleteManyByModule(req, res);
      expect(JobCategory.deleteMany).toHaveBeenCalledWith({ jc_id: { $in: [7, 8] } });
      expect(functions.success).toHaveBeenCalledWith(res, "xóa thành công!");
    });
  
    // TC91: Xóa tỉnh/thành phố thành công (moduleId = 38)
    it("TC91 - ✅ Xóa thành phố hoặc quận (moduleId = 38)", async () => {
      setReq(38, [9]);
      await deleteManyByModule(req, res);
      expect(City2.deleteMany).toHaveBeenCalledWith({ cit_id: { $in: [9] } });
      expect(functions.success).toHaveBeenCalledWith(res, "xóa thành công!");
    });
  
    // TC92: Thiếu moduleId => báo lỗi
    it("TC92 - ❌ Thiếu moduleId hoặc arrId", async () => {
      req.body = { moduleId: null, arrId: [1] };
      await deleteManyByModule(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, "Truyền moduleId va arrId dạng mảng", 405);
    });
  
    // TC93: arrId rỗng => báo lỗi
    it("TC93 - ❌ arrId rỗng", async () => {
      setReq(95, []);
      await deleteManyByModule(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, "Truyền moduleId và arrId dạng mảng", 405);
    });
  
    // TC94: moduleId không hỗ trợ => báo lỗi
    it("TC94 - ❌ moduleId không đúng danh sách hỗ trợ", async () => {
      setReq(999, [1, 2]);
      await deleteManyByModule(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, "Truyền đúng moduleId muốn xóa", 406);
    });
  
    // TC95: Xảy ra lỗi khi gọi deleteMany => báo lỗi
    it("TC95 - ❌ Xảy ra lỗi trong quá trình xóa", async () => {
      setReq(96, [1, 2]);
      Users.deleteMany.mockRejectedValue(new Error("MongoDB error"));
      await deleteManyByModule(req, res);
      expect(functions.setError).toHaveBeenCalledWith(res, "MongoDB error");
    });
  });
  