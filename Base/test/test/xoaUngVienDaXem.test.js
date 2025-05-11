const { xoaUngVienDaXem } = require('../controllers/vieclamtheogio/manageAccountCompany');
const XemUv = require('../models/ViecLamTheoGio/XemUv');
const functions = require('../services/functions');

jest.mock('../models/ViecLamTheoGio/XemUv');
jest.mock('../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - xoaUngVienDaXem', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {};
    jest.clearAllMocks();
  });

  test('XUVDX_TC01 - Xóa thành công khi có id và tìm thấy bản ghi', async () => {
    req.body.id = 123;
    const fakeRecord = { xm_id: 123 };

    XemUv.findOneAndDelete.mockResolvedValue(fakeRecord);

    await xoaUngVienDaXem(req, res);

    expect(XemUv.findOneAndDelete).toHaveBeenCalledWith({ xm_id: 123 });
    expect(functions.success).toHaveBeenCalledWith(
      res,
      "Xoa ung vien khoi danh sach thanh cong!"
    );
  });

  test('XUVDX_TC02 - Không tìm thấy bản ghi để xóa', async () => {
    req.body.id = 999;

    XemUv.findOneAndDelete.mockResolvedValue(null);

    await xoaUngVienDaXem(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Ban ghi not found!", 404);
  });

  test('XUVDX_TC03 - Thiếu input id', async () => {
    req.body = {}; // không có id

    await xoaUngVienDaXem(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input id", 405);
    expect(XemUv.findOneAndDelete).not.toHaveBeenCalled();
  });

  test('XUVDX_TC04 - id là string, vẫn hoạt động bình thường sau khi ép kiểu', async () => {
    req.body.id = '456';
    const fakeRecord = { xm_id: 456 };

    XemUv.findOneAndDelete.mockResolvedValue(fakeRecord);

    await xoaUngVienDaXem(req, res);

    expect(XemUv.findOneAndDelete).toHaveBeenCalledWith({ xm_id: 456 });
    expect(functions.success).toHaveBeenCalled();
  });

  test('XUVDX_TC05 - Gặp lỗi trong quá trình xử lý (try-catch)', async () => {
    req.body.id = 111;
    XemUv.findOneAndDelete.mockRejectedValue(new Error('Mongo error'));

    await xoaUngVienDaXem(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Mongo error');
  });
});
