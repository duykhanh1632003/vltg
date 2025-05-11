const { getThongBaoNtd } = require('../controllers/vieclamtheogio/manageAccountCompany');
const ThongBaoNtd = require('../models/ViecLamTheoGio/ThongBaoNtd');
const functions = require('../services/functions');

jest.mock('../models/ViecLamTheoGio/ThongBaoNtd');
jest.mock('../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - getThongBaoNtd', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { data: { _id: 123 } } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test('GTB_TC01 - Lấy thông báo thành công (danh sách có phần tử)', async () => {
    const mockThongBao = [{ tb_id: 1, tb_name: 'Thông báo 1' }];
    ThongBaoNtd.find.mockResolvedValue(mockThongBao);

    await getThongBaoNtd(req, res);

    expect(ThongBaoNtd.find).toHaveBeenCalledWith({ td_ntd: 123 });
    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Lay ra thong bao thanh cong',
      { data: mockThongBao }
    );
  });

  test('GTB_TC02 - Lấy thông báo thành công (danh sách rỗng)', async () => {
    ThongBaoNtd.find.mockResolvedValue([]);

    await getThongBaoNtd(req, res);

    expect(ThongBaoNtd.find).toHaveBeenCalledWith({ td_ntd: 123 });
    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Lay ra thong bao thanh cong',
      { data: [] }
    );
  });

  test('GTB_TC03 - Ném lỗi exception trong try/catch', async () => {
    ThongBaoNtd.find.mockRejectedValue(new Error('DB crash'));

    await getThongBaoNtd(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB crash');
  });
});
