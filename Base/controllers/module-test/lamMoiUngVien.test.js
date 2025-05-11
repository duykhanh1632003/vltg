const { lamMoiUngVien } = require('../vieclamtheogio/manageAccountCandidate');
const Users = require('../../models/ViecLamTheoGio/Users');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
  convertTimestamp: jest.fn(() => 'mocked-time'),
}));

describe('Unit Test - lamMoiUngVien', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Thiếu id_uv', async () => {
    req.body.id_uv = null;

    await lamMoiUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input id_uv', 405);
  });

  test('TC02 - Có id_uv nhưng user không tồn tại hoặc type khác 0', async () => {
    req.body.id_uv = 123;
    Users.findOneAndUpdate.mockResolvedValue(null); // Không tìm thấy user

    await lamMoiUngVien(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 123, type: 0 },
      { updatedAt: 'mocked-time' },
      { new: true }
    );
    expect(functions.setError).toHaveBeenCalledWith(res, 'Lam moi ung vien that bai', 405);
  });

  test('TC03 - id_uv hợp lệ, update thành công', async () => {
    req.body.id_uv = 456;
    const mockUser = { _id: 456, updatedAt: 'mocked-time' };
    Users.findOneAndUpdate.mockResolvedValue(mockUser);

    await lamMoiUngVien(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalledWith(res, 'Lam moi ung vien thanh cong!');
  });

  test('TC04 - Xảy ra lỗi trong xử lý', async () => {
    req.body.id_uv = 999;
    Users.findOneAndUpdate.mockRejectedValue(new Error('DB error'));

    await lamMoiUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB error');
  });
});
