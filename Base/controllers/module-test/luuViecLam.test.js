const { luuViecLam } = require('../vieclamtheogio/manageAccountCandidate');
const ViecLam = require('../../models/ViecLamTheoGio/ViecLam');
const Users = require('../../models/ViecLamTheoGio/Users');
const UvSaveVl = require('../../models/ViecLamTheoGio/UvSaveVl');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/ViecLam');
jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../models/ViecLamTheoGio/UvSaveVl');
jest.mock('../../services/functions', () => ({
  getMaxIdByField: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - luuViecLam', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'user123' } },
      body: {},
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Thiếu id_viec hoặc id_viec là null/undefined', async () => {
    req.body = {};
    await luuViecLam(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input id_viec', 405);
  });

  test('TC02 - id_viec hợp lệ nhưng không tồn tại trong ViecLam', async () => {
    req.body = { id_viec: 101 };
    ViecLam.findOne.mockResolvedValue(null);
    await luuViecLam(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'Viec lam not found!', 406);
  });

  test('TC03 - ViecLam tồn tại nhưng không tìm thấy NTD', async () => {
    req.body = { id_viec: 101 };
    ViecLam.findOne.mockResolvedValue({ id_ntd: 'ntd123' });
    Users.findOne.mockResolvedValue(null); // NTD not found
    await luuViecLam(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'Nha tuyen dung not found!', 406);
  });

  test('TC04 - Việc làm đã được lưu trước đó', async () => {
    req.body = { id_viec: 101 };
    ViecLam.findOne.mockResolvedValue({ id_ntd: 'ntd123' });
    Users.findOne.mockResolvedValue({ _id: 'ntd123', type: 1 });
    UvSaveVl.findOne.mockResolvedValue({ id_viec: 101 }); // Đã lưu
    await luuViecLam(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'Da luu viec lam nay roi', 400);
  });

  test('TC05 - Lưu việc làm thành công', async () => {
    req.body = { id_viec: 101 };
    ViecLam.findOne.mockResolvedValue({ id_ntd: 'ntd123', ntd_name: 'NTD ABC' });
    Users.findOne.mockResolvedValue({ _id: 'ntd123', type: 1 });
    UvSaveVl.findOne.mockResolvedValue(null); // Chưa từng lưu
    functions.getMaxIdByField.mockResolvedValue(999);
    UvSaveVl.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));

    await luuViecLam(req, res);
    expect(functions.success).toHaveBeenCalledWith(res, 'Luu viec lam thanh cong!');
  });

  test('TC06 - Gọi save nhưng thất bại', async () => {
    req.body = { id_viec: 101 };
    ViecLam.findOne.mockResolvedValue({ id_ntd: 'ntd123', ntd_name: 'NTD ABC' });
    Users.findOne.mockResolvedValue({ _id: 'ntd123', type: 1 });
    UvSaveVl.findOne.mockResolvedValue(null); // Chưa từng lưu
    functions.getMaxIdByField.mockResolvedValue(1001);
    const mockSave = jest.fn().mockResolvedValue(false);
    UvSaveVl.mockImplementation(() => ({ save: mockSave }));

    await luuViecLam(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'Luu viec lam khong thanh cong', 500);
  });

  test('TC07 - Throw error trong thao tác DB (Ví dụ lỗi connect)', async () => {
    req.body = { id_viec: 101 };
    ViecLam.findOne.mockRejectedValue(new Error('DB error'));

    await luuViecLam(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'DB error');
  });

  test('TC08 - req.user.data._id = null', async () => {
    req.user.data._id = null;
    req.body = { id_viec: 101 };
    await luuViecLam(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input id_viec', 405); // Vì userId null => giống thiếu input
  });
});
