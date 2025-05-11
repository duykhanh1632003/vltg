const { getKinhNghiemLamViec } = require('../vieclamtheogio/manageAccountCandidate');
const UvKnlv = require('../../models/ViecLamTheoGio/UvKnlv');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/UvKnlv');
jest.mock('../../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - getKinhNghiemLamViec', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { data: { _id: 'user123' } } };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - UvKnlv.find() trả về danh sách kinh nghiệm', async () => {
    const mockKinhNghiem = [
      { id_knlv: 1, ten_cong_ty: 'ABC', vi_tri: 'Dev' },
      { id_knlv: 2, ten_cong_ty: 'XYZ', vi_tri: 'Tester' },
    ];

    UvKnlv.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockKinhNghiem) });

    await getKinhNghiemLamViec(req, res);

    expect(UvKnlv.find).toHaveBeenCalledWith({ id_uv_knlv: 'user123' });
    expect(functions.success).toHaveBeenCalledWith(res, 'get info kinh nghiem lam viec thanh cong', {
      data: mockKinhNghiem,
    });
  });

  test('TC02 - UvKnlv.find() trả về mảng rỗng', async () => {
    UvKnlv.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    await getKinhNghiemLamViec(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, 'get info kinh nghiem lam viec thanh cong', {
      data: [],
    });
  });

  test('TC03 - UvKnlv.find() ném lỗi', async () => {
    const error = new Error('DB failed');
    UvKnlv.find.mockImplementation(() => {
      throw error;
    });

    await getKinhNghiemLamViec(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB failed');
  });
});
