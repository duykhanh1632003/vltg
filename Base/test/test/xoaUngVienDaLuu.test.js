const { xoaUngVienDaLuu } = require('../controllers/vieclamtheogio/manageAccountCompany'); // Thay bằng đường dẫn thực tế
const NtdSaveUv = require('../models/ViecLamTheoGio/NtdSaveUv');
const functions = require('../services/functions');

jest.mock('../models/ViecLamTheoGio/NtdSaveUv.js');
jest.mock('../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - xoaUngVienDaLuu', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { id_uv: '1' },
      user: { data: { _id: 100 } },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  test('XUVDL_TC01 - Xóa ứng viên đã lưu thành công', async () => {
    NtdSaveUv.findOneAndDelete.mockResolvedValue({
      id: 1,
      id_ntd: 100,
      id_uv: 1,
      created_at: new Date(),
    });

    await xoaUngVienDaLuu(req, res);

    expect(NtdSaveUv.findOneAndDelete).toHaveBeenCalledWith({
      id_uv: 1,
      id_ntd: 100,
    });
    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Xoa ung vien khoi danh sach thanh cong!'
    );
  });

  test('XUVDL_TC02 - Thất bại do không tìm thấy bản ghi', async () => {
    NtdSaveUv.findOneAndDelete.mockResolvedValue(null);

    await xoaUngVienDaLuu(req, res);

    expect(NtdSaveUv.findOneAndDelete).toHaveBeenCalledWith({
      id_uv: 1,
      id_ntd: 100,
    });
    expect(functions.setError).toHaveBeenCalledWith(res, 'Ban ghi not found!', 404);
  });

  test('XUVDL_TC03 - Thất bại do thiếu id_uv', async () => {
    req.body.id_uv = null;

    await xoaUngVienDaLuu(req, res);

    expect(NtdSaveUv.findOneAndDelete).not.toHaveBeenCalled();
    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input', 405);
  });

  test('XUVDL_TC04 - Thất bại do thiếu id_ntd', async () => {
    req.user = null;

    await xoaUngVienDaLuu(req, res);

    expect(NtdSaveUv.findOneAndDelete).not.toHaveBeenCalled();
    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input', 405);
  });

  test('XUVDL_TC05 - Thất bại do lỗi trong truy vấn NtdSaveUv', async () => {
    NtdSaveUv.findOneAndDelete.mockRejectedValue(new Error('Database error'));

    await xoaUngVienDaLuu(req, res);

    expect(NtdSaveUv.findOneAndDelete).toHaveBeenCalledWith({
      id_uv: 1,
      id_ntd: 100,
    });
    expect(functions.setError).toHaveBeenCalledWith(res, 'Database error');
  });
});