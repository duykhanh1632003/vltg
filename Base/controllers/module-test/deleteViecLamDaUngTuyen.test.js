const { deleteViecLamDaUngTuyen } = require('../vieclamtheogio/manageAccountCandidate');
const UngTuyen = require('../../models/ViecLamTheoGio/UngTuyen');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/UngTuyen');
jest.mock('../../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - deleteViecLamDaUngTuyen', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'user123' } },
      body: {},
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Xóa thành công bản ghi ứng tuyển', async () => {
    req.body.id_viec = '456';

    UngTuyen.deleteMany.mockResolvedValue({ deletedCount: 2 });

    await deleteViecLamDaUngTuyen(req, res);

    expect(UngTuyen.deleteMany).toHaveBeenCalledWith({
      id_uv: 'user123',
      id_viec: 456,
    });
    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Delete viec lam da ung tuyen thanh cong!'
    );
  });

  test('TC02 - Không có bản ghi nào được xóa (không tìm thấy)', async () => {
    req.body.id_viec = '789';

    UngTuyen.deleteMany.mockResolvedValue({ deletedCount: 0 });

    await deleteViecLamDaUngTuyen(req, res);

    expect(functions.setError).toHaveBeenCalledWith(
      res,
      'Viec lam da ung tuyen not found',
      405
    );
  });

  test('TC03 - Không truyền id_viec', async () => {
    await deleteViecLamDaUngTuyen(req, res);

    expect(UngTuyen.deleteMany).not.toHaveBeenCalled();
    expect(functions.setError).toHaveBeenCalledWith(
      res,
      'Missing input id_viec',
      405
    );
  });

  test('TC04 - Giả lập lỗi trong UngTuyen.deleteMany', async () => {
    req.body.id_viec = '999';

    const error = new Error('MongoDB connection lost');
    UngTuyen.deleteMany.mockRejectedValue(error);

    await deleteViecLamDaUngTuyen(req, res);

    expect(functions.setError).toHaveBeenCalledWith(
      res,
      'MongoDB connection lost'
    );
  });
});
