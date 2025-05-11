const { updateBuoiCoTheDiLam } = require('../vieclamtheogio/manageAccountCandidate');
const Users = require('../../models/ViecLamTheoGio/Users');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
  convertTimestamp: jest.fn(() => '2025-04-16T12:00:00.000Z'), // mock cứng timestamp
}));

describe('Unit Test - updateBuoiCoTheDiLam', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'user123' } },
      body: {},
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - req.body.day là undefined', async () => {
    req.body.day = undefined;

    await updateBuoiCoTheDiLam(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input day!', 405);
  });

  test('TC02 - req.body.day là mảng rỗng', async () => {
    req.body.day = [];

    await updateBuoiCoTheDiLam(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input day!', 405);
  });

  test('TC03 - day hợp lệ, nhưng không tìm thấy user (Users.findOneAndUpdate trả về null)', async () => {
    req.body.day = ['Thứ 2', 'Thứ 4'];
    Users.findOneAndUpdate.mockResolvedValue(null);

    await updateBuoiCoTheDiLam(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'user123', type: 0 },
      {
        updatedAt: '2025-04-16T12:00:00.000Z',
        uv_day: 'Thứ 2, Thứ 4',
      },
      { new: true }
    );
    expect(functions.setError).toHaveBeenCalledWith(res, 'ung vien not fund!', 404);
  });

  test('TC04 - Cập nhật thành công', async () => {
    req.body.day = ['Thứ 2', 'Thứ 4'];
    const mockUser = { _id: 'user123', uv_day: 'Thứ 2, Thứ 4' };
    Users.findOneAndUpdate.mockResolvedValue(mockUser);

    await updateBuoiCoTheDiLam(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, 'update ung vien thanh cong');
  });

  test('TC05 - Gặp lỗi bất ngờ khi gọi Users.findOneAndUpdate (throw)', async () => {
    req.body.day = ['Thứ 2', 'Thứ 4'];
    Users.findOneAndUpdate.mockImplementation(() => {
      throw new Error('DB connection lost');
    });

    await updateBuoiCoTheDiLam(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB connection lost');
  });
});
