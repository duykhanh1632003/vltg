const { getThongBaoUv } = require('../vieclamtheogio/manageAccountCandidate');
const ThongBaoUv = require('../../models/ViecLamTheoGio/ThongBaoUv');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/ThongBaoUv');
jest.mock('../../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - getThongBaoUv', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        data: {
          _id: 'user123',
        },
      },
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Lấy thông báo thành công', async () => {
    const mockData = [{ message: 'Thông báo 1' }, { message: 'Thông báo 2' }];
    ThongBaoUv.find.mockResolvedValue(mockData);

    await getThongBaoUv(req, res);

    expect(ThongBaoUv.find).toHaveBeenCalledWith({ td_uv: 'user123' });
    expect(functions.success).toHaveBeenCalledWith(res, 'Lay ra thong bao thanh cong', {
      data: mockData,
    });
  });

  test('TC02 - Xảy ra lỗi trong DB', async () => {
    ThongBaoUv.find.mockRejectedValue(new Error('Database error'));

    await getThongBaoUv(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Database error');
  });
});
