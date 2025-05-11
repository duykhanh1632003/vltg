const { ntdSaveUv } = require('../controllers/vieclamtheogio/manageAccountCompany');
const Users = require('../models/ViecLamTheoGio/Users');
const NtdSaveUv = require('../models/ViecLamTheoGio/NtdSaveUv');
const ThongBaoUv = require('../models/ViecLamTheoGio/ThongBaoUv');
const functions = require('../services/functions');

jest.mock('../models/ViecLamTheoGio/Users');
jest.mock('../models/ViecLamTheoGio/NtdSaveUv');
jest.mock('../models/ViecLamTheoGio/ThongBaoUv');
jest.mock('../services/functions', () => ({
  getMaxIdByField: jest.fn(),
  convertTimestamp: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - ntdSaveUv', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 1 } },
      body: { id_uv: 2 },
    };
    res = {};
    jest.clearAllMocks();
  });

  test('SUV_TC01 - Thiếu id_uv', async () => {
    delete req.body.id_uv;

    await ntdSaveUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input id_uv', 405);
  });

  test('SUV_TC02 - Không tìm thấy nhà tuyển dụng hoặc ứng viên', async () => {
    Users.findOne
      .mockResolvedValueOnce(null); // Không tìm thấy NTD

    await ntdSaveUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(
      res,
      'Nha tuyen dung or Ung vien khong ton tai',
      404
    );
  });

  test('SUV_TC03 - Ứng viên đã được lưu trước đó', async () => {
    Users.findOne
      .mockResolvedValueOnce({ _id: 1, type: 1 }) // NTD
      .mockResolvedValueOnce({ _id: 2, type: 0 }); // UV
    NtdSaveUv.findOne.mockResolvedValueOnce({ id: 123 }); // Đã lưu

    await ntdSaveUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Ung vien da duoc luu!', 400);
  });

  test('SUV_TC04 - Lưu ứng viên thất bại (save trả về null)', async () => {
    Users.findOne
      .mockResolvedValueOnce({ _id: 1, type: 1 }) // NTD
      .mockResolvedValueOnce({ _id: 2, type: 0 }); // UV
    NtdSaveUv.findOne.mockResolvedValueOnce(null);
    functions.getMaxIdByField
      .mockResolvedValueOnce(999); // id mới

    NtdSaveUv.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(null),
    }));

    await ntdSaveUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Ntd luu ung vien that bai', 405);
  });

  test('SUV_TC05 - Lưu ứng viên thành công', async () => {
    const mockNtd = { _id: 1, type: 1, userName: 'Công ty ABC', avatarUser: 'avatar.png' };
    const mockUv = { _id: 2, type: 0 };

    Users.findOne
      .mockResolvedValueOnce(mockNtd) // NTD
      .mockResolvedValueOnce(mockUv); // UV

    NtdSaveUv.findOne.mockResolvedValueOnce(null);

    functions.getMaxIdByField
      .mockResolvedValueOnce(1001) // id cho NtdSaveUv
      .mockResolvedValueOnce(2002); // id cho ThongBaoUv

    functions.convertTimestamp.mockReturnValue(1234567890);

    NtdSaveUv.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({}),
    }));

    ThongBaoUv.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({}),
    }));

    await ntdSaveUv(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, 'Nha tuyen dung luu ung vien thanh cong!');
  });

  test('SUV_TC06 - Xử lý lỗi exception (catch)', async () => {
    Users.findOne.mockRejectedValue(new Error('DB Error'));

    await ntdSaveUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB Error');
  });
});
