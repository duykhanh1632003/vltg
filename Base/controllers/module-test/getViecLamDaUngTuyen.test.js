const { getViecLamDaUngTuyen } = require('../vieclamtheogio/manageAccountCandidate');
const ViecLam = require('../../models/ViecLamTheoGio/ViecLam');
const UngTuyen = require('../../models/ViecLamTheoGio/UngTuyen');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/ViecLam');
jest.mock('../../models/ViecLamTheoGio/UngTuyen');
jest.mock('../../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - getViecLamDaUngTuyen', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'user123' } },
      body: {},
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Không truyền page và pageSize', async () => {
    const mockList = [{ id_vieclam: '123', UngTuyen: [{ id_uv: 'user123' }] }];
    const mockTotal = ['123'];

    ViecLam.aggregate.mockResolvedValue(mockList);
    UngTuyen.distinct.mockResolvedValue(mockTotal);

    await getViecLamDaUngTuyen(req, res);

    expect(ViecLam.aggregate).toHaveBeenCalled();
    expect(UngTuyen.distinct).toHaveBeenCalledWith('id_viec', { id_uv: 'user123' });
    expect(functions.success).toHaveBeenCalledWith(res, expect.any(String), {
      total: 1,
      data: mockList,
    });
  });

  test('TC02 - Truyền page = 2, pageSize = 3', async () => {
    req.body = { page: 2, pageSize: 3 };

    const mockList = [{ id_vieclam: '456', UngTuyen: [{ id_uv: 'user123' }] }];
    const mockTotal = ['456', '789'];

    ViecLam.aggregate.mockResolvedValue(mockList);
    UngTuyen.distinct.mockResolvedValue(mockTotal);

    await getViecLamDaUngTuyen(req, res);

    expect(ViecLam.aggregate).toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalledWith(res, expect.any(String), {
      total: 2,
      data: mockList,
    });
  });

  test('TC03 - Không có bản ghi ứng tuyển nào', async () => {
    ViecLam.aggregate.mockResolvedValue([]);
    UngTuyen.distinct.mockResolvedValue([]);

    await getViecLamDaUngTuyen(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, expect.any(String), {
      total: 0,
      data: [],
    });
  });

  test('TC04 - Lỗi trong ViecLam.aggregate', async () => {
    const error = new Error('Aggregate error');
    ViecLam.aggregate.mockRejectedValue(error);

    await getViecLamDaUngTuyen(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Aggregate error');
  });

  test('TC05 - Lỗi trong UngTuyen.distinct', async () => {
    ViecLam.aggregate.mockResolvedValue([{ id_vieclam: '123', UngTuyen: [] }]);
    UngTuyen.distinct.mockRejectedValue(new Error('Distinct error'));

    await getViecLamDaUngTuyen(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Distinct error');
  });
});
