const { updateStatusSearch } = require('../vieclamtheogio/manageAccountCandidate');
const Users = require('../../models/ViecLamTheoGio/Users');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../services/functions', () => ({
  convertTimestamp: jest.fn(),
  success: jest.fn(),
  setError: jest.fn()
}));

describe('Unit Test - updateStatusSearch', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { data: { _id: 123 } }
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Có id_uv hợp lệ và status là 1', async () => {
    req.body = { id_uv: 123, status: 1 };
    const mockUser = { _id: 123, uv_search: 0 };
    Users.findOne.mockResolvedValue(mockUser);
    functions.convertTimestamp.mockReturnValue(1712222222);
    Users.findOneAndUpdate.mockResolvedValue({});

    await updateStatusSearch(req, res);

    expect(Users.findOne).toHaveBeenCalledWith({ _id: 123, type: 0 }, { _id: 1, uv_search: 1 });
    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 123, type: 0 },
      { updatedAt: 1712222222, uv_search: 1 }
    );
    expect(functions.success).toHaveBeenCalledWith(res, 'update status search candidate success!');
  });

  test('TC02 - Không có id_uv trong body, lấy từ req.user', async () => {
    req.body = { status: 0 };
    const mockUser = { _id: 123, uv_search: 1 };
    Users.findOne.mockResolvedValue(mockUser);
    functions.convertTimestamp.mockReturnValue(1711111111);

    await updateStatusSearch(req, res);

    expect(Users.findOne).toHaveBeenCalledWith({ _id: 123, type: 0 }, { _id: 1, uv_search: 1 });
    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 123, type: 0 },
      { updatedAt: 1711111111, uv_search: 0 }
    );
    expect(functions.success).toHaveBeenCalledWith(res, 'update status search candidate success!');
  });

  test('TC03 - Không truyền status, mặc định là 0', async () => {
    req.body = { id_uv: 123 };
    const mockUser = { _id: 123, uv_search: 1 };
    Users.findOne.mockResolvedValue(mockUser);
    functions.convertTimestamp.mockReturnValue(1711000000);

    await updateStatusSearch(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 123, type: 0 },
      { updatedAt: 1711000000, uv_search: 0 }
    );
    expect(functions.success).toHaveBeenCalledWith(res, 'update status search candidate success!');
  });

  test('TC04 - id_uv sai, không tìm thấy ứng viên', async () => {
    req.body = { id_uv: 999, status: 1 };
    Users.findOne.mockResolvedValue(null);

    await updateStatusSearch(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Nha tuyen dung khong ton tai!', 400);
  });

  test('TC05 - Lỗi trong try-catch', async () => {
    req.body = { id_uv: 123, status: 1 };
    Users.findOne.mockImplementation(() => { throw new Error('Unexpected error') });

    await updateStatusSearch(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Unexpected error');
  });
});
