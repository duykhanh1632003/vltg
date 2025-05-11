const { updateKinhNghiemLamViec } = require('../vieclamtheogio/manageAccountCandidate');
const Users = require('../../models/ViecLamTheoGio/Users');
const UvKnlv = require('../../models/ViecLamTheoGio/UvKnlv');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../models/ViecLamTheoGio/UvKnlv');
jest.mock('../../services/functions', () => ({
  convertTimestamp: jest.fn(),
  checkDate: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - updateKinhNghiemLamViec', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'user123' } },
      body: {},
    };
    res = {};
    jest.clearAllMocks();
    functions.convertTimestamp.mockReturnValue(1234567890);
  });

  test('TC01 - Thiếu dữ liệu bắt buộc (ví dụ thiếu chuc_danh)', async () => {
    req.body = {
      id_knlv: 1,
      time_fist: '2024-05-01',
      time_end: '2024-06-01',
      cty_name: 'Company',
      mota: 'Description',
    };

    await updateKinhNghiemLamViec(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input value', 405);
  });

  test('TC02 - Dữ liệu ngày không hợp lệ', async () => {
    req.body = {
      id_knlv: 1,
      chuc_danh: 'Dev',
      time_fist: 'invalid-date',
      time_end: 'invalid-date',
      cty_name: 'Company',
      mota: 'Description',
    };
    functions.checkDate.mockReturnValue(false);

    await updateKinhNghiemLamViec(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'invalid date', 406);
  });

  test('TC03 - time_end > now hoặc time_end < time_fist', async () => {
    req.body = {
      id_knlv: 1,
      chuc_danh: 'Dev',
      time_fist: '2026-01-01',
      time_end: '2026-01-02',
      cty_name: 'Company',
      mota: 'Description',
    };

    functions.checkDate.mockReturnValue(true);

    await updateKinhNghiemLamViec(req, res);

    expect(functions.setError).toHaveBeenCalledWith(
      res,
      'time_end > now or time_fist > now or time_end<time_fist',
      407
    );
  });

  test('TC04 - user không tồn tại (Users.findOneAndUpdate trả về null)', async () => {
    req.body = {
      id_knlv: 1,
      chuc_danh: 'Dev',
      time_fist: '2023-01-01',
      time_end: '2023-12-01',
      cty_name: 'Company',
      mota: 'Description',
    };

    functions.checkDate.mockReturnValue(true);
    Users.findOneAndUpdate.mockResolvedValue(null);

    await updateKinhNghiemLamViec(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalled();
    expect(functions.setError).toHaveBeenCalledWith(res, 'user not found!', 404);
  });

  test('TC05 - user tìm thấy nhưng UvKnlv không tồn tại', async () => {
    req.body = {
      id_knlv: 1,
      chuc_danh: 'Dev',
      time_fist: '2023-01-01',
      time_end: '2023-12-01',
      cty_name: 'Company',
      mota: 'Description',
    };

    functions.checkDate.mockReturnValue(true);
    Users.findOneAndUpdate.mockResolvedValue({ _id: 'user123', type: 0 });
    UvKnlv.findOneAndUpdate.mockResolvedValue(null);

    await updateKinhNghiemLamViec(req, res);

    expect(UvKnlv.findOneAndUpdate).toHaveBeenCalled();
    expect(functions.setError).toHaveBeenCalledWith(res, 'kinh nghiem lam viec not found!', 408);
  });

  test('TC06 - Update thành công', async () => {
    req.body = {
      id_knlv: 1,
      chuc_danh: 'Dev',
      time_fist: '2023-01-01',
      time_end: '2023-12-01',
      cty_name: 'Company',
      mota: 'Description',
    };

    functions.checkDate.mockReturnValue(true);
    Users.findOneAndUpdate.mockResolvedValue({ _id: 'user123', type: 0 });
    UvKnlv.findOneAndUpdate.mockResolvedValue({ id_knlv: 1 });

    await updateKinhNghiemLamViec(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, 'update kinh nghiem lam viec success!');
  });

  test('TC07 - Lỗi bất ngờ trong quá trình xử lý', async () => {
    const error = new Error('DB ERROR');
    functions.checkDate.mockImplementation(() => { throw error; });

    req.body = {
      id_knlv: 1,
      chuc_danh: 'Dev',
      time_fist: '2024-01-01',
      time_end: '2024-02-01',
      cty_name: 'Company',
      mota: 'Details',
    };

    await updateKinhNghiemLamViec(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB ERROR');
  });
});
