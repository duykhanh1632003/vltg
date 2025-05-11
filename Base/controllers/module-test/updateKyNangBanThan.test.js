const { updateKyNangBanThan } = require('../vieclamtheogio/manageAccountCandidate');
const Users = require('../../models/ViecLamTheoGio/Users');
const UvCvmm = require('../../models/ViecLamTheoGio/UvCvmm');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../models/ViecLamTheoGio/UvCvmm');
jest.mock('../../services/functions', () => ({
  convertTimestamp: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - updateKyNangBanThan', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 123 } },
      body: {},
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - User không tồn tại (Users.findOneAndUpdate() trả về null)', async () => {
    req.body.ky_nang = 'Giao tiếp';
    functions.convertTimestamp.mockReturnValue(123456789);
    Users.findOneAndUpdate.mockResolvedValue(null);

    await updateKyNangBanThan(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 123, type: 0 },
      { updatedAt: 123456789 },
      { new: true }
    );
    expect(functions.setError).toHaveBeenCalledWith(res, 'user not found!', 404);
  });

  test('TC02 - User tồn tại nhưng uvCvmm null', async () => {
    req.body.ky_nang = 'Làm việc nhóm';
    functions.convertTimestamp.mockReturnValue(987654321);
    Users.findOneAndUpdate.mockResolvedValue({ _id: 123 });
    UvCvmm.findOneAndUpdate.mockResolvedValue(null);

    await updateKyNangBanThan(req, res);

    expect(UvCvmm.findOneAndUpdate).toHaveBeenCalledWith(
      { id_uv_cvmm: 123 },
      { ky_nang: 'Làm việc nhóm' },
      { new: true, upsert: true }
    );
    expect(functions.setError).toHaveBeenCalledWith(res, 'Update cvmm fail!', 406);
  });

  test('TC03 - Update kỹ năng thành công', async () => {
    req.body.ky_nang = 'Giao tiếp, quản lý thời gian';
    functions.convertTimestamp.mockReturnValue(444444444);
    const mockUser = { _id: 123 };
    const mockUvCvmm = { id_uv_cvmm: 123, ky_nang: 'Giao tiếp, quản lý thời gian' };

    Users.findOneAndUpdate.mockResolvedValue(mockUser);
    UvCvmm.findOneAndUpdate.mockResolvedValue(mockUvCvmm);

    await updateKyNangBanThan(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, 'Update cvmm success!', { uvCvmm: mockUvCvmm });
  });

  test('TC04 - Ném lỗi trong try', async () => {
    req.body.ky_nang = 'Giải quyết vấn đề';
    functions.convertTimestamp.mockReturnValue(555555555);
    Users.findOneAndUpdate.mockRejectedValue(new Error('Unexpected DB error'));

    await updateKyNangBanThan(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Unexpected DB error');
  });
});
