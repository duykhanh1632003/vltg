const { xoaThongBaoUv } = require('../vieclamtheogio/manageAccountCandidate');
const ThongBaoUv = require('../../models/ViecLamTheoGio/ThongBaoUv');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/ThongBaoUv');
jest.mock('../../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - xoaThongBaoUv', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Xóa thành công với tb_id hợp lệ', async () => {
    req.body.tb_id = ['123', '456'];

    ThongBaoUv.deleteMany.mockResolvedValue({ deletedCount: 2 });

    await xoaThongBaoUv(req, res);

    expect(ThongBaoUv.deleteMany).toHaveBeenCalledWith({
      tb_id: { $in: [123, 456] },
    });
    expect(functions.success).toHaveBeenCalledWith(res, 'Delete Thong bao thanh cong!');
  });

  test('TC02 - Thiếu input tb_id', async () => {
    req.body.tb_id = [];

    await xoaThongBaoUv(req, res);

    expect(ThongBaoUv.deleteMany).not.toHaveBeenCalled();
    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input tb_id', 405);
  });

  test('TC03 - Lỗi trong deleteMany', async () => {
    req.body.tb_id = ['123'];
    ThongBaoUv.deleteMany.mockRejectedValue(new Error('Delete error'));

    await xoaThongBaoUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Delete error');
  });
});
