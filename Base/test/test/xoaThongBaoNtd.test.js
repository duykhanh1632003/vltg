const { xoaThongBaoNtd } = require('../controllers/vieclamtheogio/manageAccountCompany'); // Đổi tên file thật sự của bạn
const ThongBaoNtd = require('../models/ViecLamTheoGio/ThongBaoNtd');
const functions = require('../services/functions');

// Mock model và service
jest.mock('../models/ViecLamTheoGio/ThongBaoNtd');
jest.mock('../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - xoaThongBaoNtd', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {}; // Có thể mock thêm nếu bạn dùng res.status().json()
    jest.clearAllMocks();
  });

  test('XTB_TC01 - Thiếu tb_id', async () => {
    await xoaThongBaoNtd(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input tb_id', 405);
  });

  test('XTB_TC02 - tb_id là mảng rỗng', async () => {
    req.body.tb_id = [];
    await xoaThongBaoNtd(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input tb_id', 405);
  });

  test('XTB_TC03 - Xoá thông báo thành công', async () => {
    req.body.tb_id = ['1001', '1002'];
    ThongBaoNtd.deleteMany.mockResolvedValue({ acknowledged: true });

    await xoaThongBaoNtd(req, res);

    expect(ThongBaoNtd.deleteMany).toHaveBeenCalledWith({ tb_id: { $in: [1001, 1002] } });
    expect(functions.success).toHaveBeenCalledWith(res, 'Delete Thong bao thanh cong!');
  });

  test('XTB_TC04 - Ném lỗi trong deleteMany', async () => {
    req.body.tb_id = ['2001'];
    ThongBaoNtd.deleteMany.mockRejectedValue(new Error('DB lỗi'));

    await xoaThongBaoNtd(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB lỗi');
  });
});
