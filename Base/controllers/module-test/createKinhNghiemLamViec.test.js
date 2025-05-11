const { createKinhNghiemLamViec } = require('../vieclamtheogio/manageAccountCandidate');
const UvKnlv = require('../../models/ViecLamTheoGio/UvKnlv');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/UvKnlv');
jest.mock('../../services/functions', () => ({
  checkDate: jest.fn(),
  getMaxIdByField: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - createKinhNghiemLamViec', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'user123' } },
      body: {},
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Thiếu dữ liệu bắt buộc (ví dụ thiếu chuc_danh)', async () => {
    req.body = {
      time_fist: '2024-05-01',
      time_end: '2024-05-10',
      cty_name: 'ABC Corp',
      mota: 'Test',
    };

    await createKinhNghiemLamViec(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input value', 405);
  });

  test('TC02 - Dữ liệu ngày không hợp lệ (checkDate false)', async () => {
    req.body = {
      chuc_danh: 'Dev',
      time_fist: 'invalid-date',
      time_end: 'invalid-date',
      cty_name: 'Company',
      mota: 'Description',
    };
    functions.checkDate.mockReturnValue(false);

    await createKinhNghiemLamViec(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'invalid date', 406);
  });

  test('TC03 - time_end < time_fist', async () => {
    req.body = {
      chuc_danh: 'Dev',
      time_fist: '2025-12-31',
      time_end: '2025-12-30',
      cty_name: 'Company',
      mota: 'Description',
    };
    functions.checkDate.mockReturnValue(true);

    await createKinhNghiemLamViec(req, res);

    expect(functions.setError).toHaveBeenCalledWith(
      res,
      'time_end > now or time_fist > now or time_end<time_fist',
      410
    );
  });

  test('TC04 - Tạo kinh nghiệm hợp lệ, lưu thành công', async () => {
    req.body = {
      chuc_danh: 'Developer',
      time_fist: '2023-06-01',
      time_end: '2023-12-01',
      cty_name: 'Tech Company',
      mota: 'Developed software',
    };

    const mockSavedDoc = {
      _doc: {
        id_knlv: 1,
        id_uv_knlv: 'user123',
        chuc_danh: 'Developer',
        time_fist: new Date('2023-06-01'),
        time_end: new Date('2023-12-01'),
        cty_name: 'Tech Company',
        mota: 'Developed software',
      },
    };

    functions.checkDate.mockReturnValue(true);
    functions.getMaxIdByField.mockResolvedValue(1);

    const saveMock = jest.fn().mockResolvedValue(mockSavedDoc);
    UvKnlv.mockImplementation(() => ({ save: saveMock }));

    await createKinhNghiemLamViec(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, 'create kinh nghiem lam viec success!', {
      data: mockSavedDoc._doc,
    });
  });

  test('TC05 - Giả lập lỗi trong try-catch', async () => {
    const error = new Error('Unexpected error');
    functions.checkDate.mockImplementation(() => { throw error; });

    req.body = {
      chuc_danh: 'Dev',
      time_fist: '2024-01-01',
      time_end: '2024-02-01',
      cty_name: 'Company',
      mota: 'Details',
    };

    await createKinhNghiemLamViec(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Unexpected error');
  });
});
