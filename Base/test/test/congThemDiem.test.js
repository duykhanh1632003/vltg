const { congThemDiem } = require('../controllers/vieclamtheogio/manageAccountCompany');
const Users = require('../models/ViecLamTheoGio/Users');
const functions = require('../services/functions');

jest.mock('../models/ViecLamTheoGio/Users');
jest.mock('../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - congThemDiem', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        data: { _id: 1 }
      }
    };
    res = {};
    jest.clearAllMocks();
  });

  test('CTD_TC01 - Cộng điểm thành công khi tìm thấy NTD', async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: 1, diem_free: 100 });

    await congThemDiem(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 1, type: 1 },
      { diem_free: 100 },
      { new: true }
    );
    expect(functions.success).toHaveBeenCalledWith(res, 'Cong diem thanh cong');
  });

  test('CTD_TC02 - Không tìm thấy NTD', async () => {
    Users.findOneAndUpdate.mockResolvedValue(null);

    await congThemDiem(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Nha tuyen dung not found!', 404);
  });

  test('CTD_TC03 - Ném exception trong try', async () => {
    Users.findOneAndUpdate.mockRejectedValue(new Error('DB connection failed'));

    await congThemDiem(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB connection failed');
  });
});
