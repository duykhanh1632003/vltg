const { getViecLamDaLuu } = require('../vieclamtheogio/manageAccountCandidate');
const UvSaveVl = require('../../models/ViecLamTheoGio/UvSaveVl');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/UvSaveVl');
jest.mock('../../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
  findCount: jest.fn(),
}));

describe('Unit Test - getViecLamDaLuu', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'user123' } },
      body: {},
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Truy vấn với page = 1, pageSize = 6 và userId hợp lệ', async () => {
    req.body = { page: 1, pageSize: 6 };

    const mockData = [{ id: 1, id_uv: 'user123', id_viec: 10 }];
    UvSaveVl.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(10);

    await getViecLamDaLuu(req, res);

    expect(UvSaveVl.aggregate).toHaveBeenCalled();
    expect(functions.findCount).toHaveBeenCalledWith(UvSaveVl, { id_uv: 'user123' });
    expect(functions.success).toHaveBeenCalledWith(res, expect.any(String), {
      total: 10,
      data: mockData,
    });
  });

  test('TC02 - Không truyền page và pageSize', async () => {
    const mockData = [];
    UvSaveVl.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(0);

    await getViecLamDaLuu(req, res);

    expect(UvSaveVl.aggregate).toHaveBeenCalled();
    expect(functions.findCount).toHaveBeenCalledWith(UvSaveVl, { id_uv: 'user123' });
    expect(functions.success).toHaveBeenCalledWith(res, expect.any(String), {
      total: 0,
      data: [],
    });
  });

  test('TC03 - Không có bản ghi trong UvSaveVl', async () => {
    UvSaveVl.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await getViecLamDaLuu(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, expect.any(String), {
      total: 0,
      data: [],
    });
  });

  test('TC04 - Bản ghi trong UvSaveVl có id_viec không khớp với VLTG_ViecLam', async () => {
    const mockData = [
      {
        id: 1,
        id_uv: 'user123',
        id_viec: 999,
        ViecLam: null, // Không tìm thấy trong bảng việc làm
      },
    ];

    UvSaveVl.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(1);

    await getViecLamDaLuu(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, expect.any(String), {
      total: 1,
      data: mockData,
    });
  });

  test('TC05 - Phân trang page = 2, pageSize = 6', async () => {
    req.body = { page: 2, pageSize: 6 };
    const mockData = Array.from({ length: 6 }).map((_, i) => ({
      id: i + 7,
      id_uv: 'user123',
      id_viec: 100 + i,
    }));

    UvSaveVl.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(12);

    await getViecLamDaLuu(req, res);

    expect(UvSaveVl.aggregate).toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalledWith(res, expect.any(String), {
      total: 12,
      data: mockData,
    });
  });

  test('TC06 - Giả lập lỗi trong aggregate', async () => {
    const error = new Error('Aggregation failed');
    UvSaveVl.aggregate.mockRejectedValue(error);

    await getViecLamDaLuu(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Aggregation failed');
  });

  test('TC07 - Giả lập lỗi trong functions.findCount', async () => {
    UvSaveVl.aggregate.mockResolvedValue([{ id: 1 }]);
    functions.findCount.mockRejectedValue(new Error('findCount error'));

    await getViecLamDaLuu(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'findCount error');
  });
});
