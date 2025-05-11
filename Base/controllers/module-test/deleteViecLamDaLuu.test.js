const { deleteViecLamDaLuu } = require('../vieclamtheogio/manageAccountCandidate');
const UvSaveVl = require('../../models/ViecLamTheoGio/UvSaveVl');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/UvSaveVl');
jest.mock('../../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - deleteViecLamDaLuu', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'user123' } },
      body: {},
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - id_viec hợp lệ, userId hợp lệ, có bản ghi trong UvSaveVl', async () => {
    req.body.id_viec = 101;
    UvSaveVl.findOneAndDelete.mockResolvedValue({ id_viec: 101 });

    await deleteViecLamDaLuu(req, res);

    expect(UvSaveVl.findOneAndDelete).toHaveBeenCalledWith({
      id_uv: 'user123',
      id_viec: 101,
    });
    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Delete viec lam da luu thanh cong!'
    );
  });

  test('TC02 - id_viec không tồn tại trong UvSaveVl của user', async () => {
    req.body.id_viec = 999;
    UvSaveVl.findOneAndDelete.mockResolvedValue(null);

    await deleteViecLamDaLuu(req, res);

    expect(functions.setError).toHaveBeenCalledWith(
      res,
      'Viec lam da luu not found',
      405
    );
  });

  test('TC03 - Không truyền id_viec trong body', async () => {
    req.body = {};

    await deleteViecLamDaLuu(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input id_viec', 405);
  });

  test('TC04 - userId không tồn tại hoặc bị sai', async () => {
    req.user = {}; // hoặc null
    req.body.id_viec = 101;

    await deleteViecLamDaLuu(req, res);

    // Có thể kiểm tra lỗi throw ra nếu không check null trong hàm gốc
    expect(functions.setError).toHaveBeenCalledWith(res, expect.any(String));
  });

  test('TC05 - id_viec là chuỗi không hợp lệ hoặc null', async () => {
    req.body.id_viec = 'abc';

    await deleteViecLamDaLuu(req, res);

    expect(UvSaveVl.findOneAndDelete).toHaveBeenCalledWith({
      id_uv: 'user123',
      id_viec: NaN,
    });
  });

  test('TC06 - Giả lập lỗi trong findOneAndDelete', async () => {
    req.body.id_viec = 101;
    const error = new Error('MongoDB connection error');
    UvSaveVl.findOneAndDelete.mockRejectedValue(error);

    await deleteViecLamDaLuu(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'MongoDB connection error');
  });
});
