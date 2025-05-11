const { thongKeDanhSachUngVien } = require("../controllers/vieclamtheogio/manageAccountCompany");
const Users = require("../models/ViecLamTheoGio/Users");
const NtdXemUv = require("../models/ViecLamTheoGio/NtdXemUv");
const NtdSaveUv = require("../models/ViecLamTheoGio/NtdSaveUv");
const XemUv = require("../models/ViecLamTheoGio/XemUv");
const functions = require("../services/functions");

jest.mock("../models/ViecLamTheoGio/Users");
jest.mock("../models/ViecLamTheoGio/NtdXemUv");
jest.mock("../models/ViecLamTheoGio/NtdSaveUv");
jest.mock("../models/ViecLamTheoGio/XemUv");
jest.mock("../services/functions");

describe("thongKeDanhSachUngVien", () => {
    let req, res, next;
  
    beforeEach(() => {
      req = {
        body: {},
        user: {
          data: { _id: 1 }
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
      jest.clearAllMocks();
    });
  
    const mockUsers = [
      {
        _id: 123,
        createdAt: 1713400000,
        avatarUser: "avatar.jpg",
        email: "abc@example.com",
        phone: "0123456789"
      }
    ];
  
    const getLinkFileMock = jest.fn().mockReturnValue("http://mock-avatar-link");
  
    it("TKDSUV_TC01 - Trả về kết quả thành công khi truyền đầy đủ bộ lọc", async () => {
      req.body = {
        page: 1,
        pageSize: 10,
        id_nganh: "123",
        id_hinhthuc: "2",
        id_city: "456",
        key: "developer"
      };
  
      Users.aggregate
        .mockResolvedValueOnce(mockUsers) // data
        .mockResolvedValueOnce([{ count: 1 }]); // total
  
      NtdXemUv.findOne.mockResolvedValueOnce(null);
      NtdSaveUv.findOne.mockResolvedValueOnce(null);
      XemUv.findOne.mockResolvedValueOnce(null);
      functions.getLinkFile = getLinkFileMock;
  
      await thongKeDanhSachUngVien(req, res, next);
  
      expect(Users.aggregate).toHaveBeenCalledTimes(2);
      expect(functions.success).toHaveBeenCalledWith(
        res,
        expect.any(String),
        expect.objectContaining({ total: 1, data: expect.any(Array) })
      );
    });
  
    it("TKDSUV_TC02 - Dùng giá trị mặc định cho page và pageSize khi không truyền vào", async () => {
      Users.aggregate
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce([{ count: 1 }]);
      NtdXemUv.findOne.mockResolvedValueOnce(null);
      NtdSaveUv.findOne.mockResolvedValueOnce(null);
      XemUv.findOne.mockResolvedValueOnce(null);
      functions.getLinkFile = getLinkFileMock;
  
      await thongKeDanhSachUngVien(req, res, next);
  
      expect(Users.aggregate).toHaveBeenCalledTimes(2);
      expect(functions.success).toHaveBeenCalled();
    });
  
    it("TKDSUV_TC03 - Ẩn email và số điện thoại nếu NTD chưa xem ứng viên", async () => {
      Users.aggregate
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce([{ count: 1 }]);
      NtdXemUv.findOne.mockResolvedValueOnce(null);
      NtdSaveUv.findOne.mockResolvedValueOnce(null);
      XemUv.findOne.mockResolvedValueOnce(null);
      functions.getLinkFile = getLinkFileMock;
  
      await thongKeDanhSachUngVien(req, res, next);
  
      const resultData = functions.success.mock.calls[0][2].data[0];
      expect(resultData.email).toBe("");
      expect(resultData.phone).toBe("");
    });
  
    it("TKDSUV_TC04 - Trả về đúng các cờ check_ntd_xem_uv, check_ntd_save_uv, check_xem_uv khi NTD đã xem và lưu ứng viên", async () => {
      Users.aggregate
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce([{ count: 1 }]);
      NtdXemUv.findOne.mockResolvedValueOnce({});
      NtdSaveUv.findOne.mockResolvedValueOnce({});
      XemUv.findOne.mockResolvedValueOnce({});
      functions.getLinkFile = getLinkFileMock;
  
      await thongKeDanhSachUngVien(req, res, next);
  
      const resultData = functions.success.mock.calls[0][2].data[0];
      expect(resultData.check_ntd_xem_uv).toBe(true);
      expect(resultData.check_ntd_save_uv).toBe(true);
      expect(resultData.check_xem_uv).toBe(true);
    });
  
    it("TKDSUV_TC05 - Trả về total = 0 nếu kết quả tổng count rỗng", async () => {
      Users.aggregate
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce([]); // empty total
  
      NtdXemUv.findOne.mockResolvedValueOnce(null);
      NtdSaveUv.findOne.mockResolvedValueOnce(null);
      XemUv.findOne.mockResolvedValueOnce(null);
      functions.getLinkFile = getLinkFileMock;
  
      await thongKeDanhSachUngVien(req, res, next);
  
      expect(functions.success).toHaveBeenCalledWith(
        res,
        expect.any(String),
        expect.objectContaining({ total: 0 })
      );
    });
  
    it("TKDSUV_TC06 - Trả về lỗi khi hàm aggregate bị lỗi", async () => {
      const error = new Error("DB error");
      Users.aggregate.mockRejectedValue(error);
      functions.setError = jest.fn();
  
      await thongKeDanhSachUngVien(req, res, next);
  
      expect(functions.setError).toHaveBeenCalledWith(res, error.message);
    });
  
    it("TKDSUV_TC07 - Xử lý đúng khi không có req.user.data", async () => {
      req.user = {}; // no data
      Users.aggregate
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce([{ count: 1 }]);
      NtdXemUv.findOne.mockResolvedValueOnce(null);
      NtdSaveUv.findOne.mockResolvedValueOnce(null);
      XemUv.findOne.mockResolvedValueOnce(null);
      functions.getLinkFile = getLinkFileMock;
  
      await thongKeDanhSachUngVien(req, res, next);
  
      expect(NtdXemUv.findOne).toHaveBeenCalledWith({
        id_ntd: null,
        id_uv: 123
      });
    });
  });
