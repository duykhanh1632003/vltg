const { ungVienDaXem } = require('../controllers/vieclamtheogio/manageAccountCompany');
const XemUv = require('../models/ViecLamTheoGio/XemUv');
const functions = require('../services/functions');

jest.mock('../models/ViecLamTheoGio/XemUv');
jest.mock('../services/functions', () => ({
  findCount: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - ungVienDaXem', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 123 } },
      body: {}
    };
    res = {};
    jest.clearAllMocks();
  });

  test('UVDX_TC01 - Trường hợp mặc định không có page/pageSize', async () => {
    const fakeData = [{ xm_id: 1 }];
    XemUv.aggregate.mockResolvedValue(fakeData);
    functions.findCount.mockResolvedValue(1);

    await ungVienDaXem(req, res);

    expect(XemUv.aggregate).toHaveBeenCalledWith(expect.any(Array));
    expect(functions.success).toHaveBeenCalledWith(res, "danh sach ung vien moi ung tuyen", {
      total: 1,
      data: fakeData,
    });
  });

  test('UVDX_TC02 - Có truyền page và pageSize', async () => {
    req.body.page = 2;
    req.body.pageSize = 10;

    const fakeData = [{ xm_id: 2 }];
    XemUv.aggregate.mockResolvedValue(fakeData);
    functions.findCount.mockResolvedValue(5);

    await ungVienDaXem(req, res);

    expect(XemUv.aggregate).toHaveBeenCalledWith(expect.any(Array));
    expect(functions.findCount).toHaveBeenCalledWith(XemUv, { xm_id_ntd: 123 });
    expect(functions.success).toHaveBeenCalledWith(res, "danh sach ung vien moi ung tuyen", {
      total: 5,
      data: fakeData,
    });
  });

  test('UVDX_TC03 - Tổng số là 0, không có dữ liệu trả về', async () => {
    XemUv.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await ungVienDaXem(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, "danh sach ung vien moi ung tuyen", {
      total: 0,
      data: [],
    });
  });

  test('UVDX_TC04 - Bị lỗi khi truy vấn aggregate', async () => {
    XemUv.aggregate.mockRejectedValue(new Error('Aggregate failed'));

    await ungVienDaXem(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Aggregate failed');
  });

  test('UVDX_TC05 - Bị lỗi khi đếm số lượng', async () => {
    XemUv.aggregate.mockResolvedValue([{ xm_id: 1 }]);
    functions.findCount.mockRejectedValue(new Error('Count failed'));

    await ungVienDaXem(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Count failed');
  });

  test('UVDX_TC06 - page hoặc pageSize là string (ép kiểu)', async () => {
    req.body.page = '3';
    req.body.pageSize = '2';

    const fakeData = [{ xm_id: 3 }];
    XemUv.aggregate.mockResolvedValue(fakeData);
    functions.findCount.mockResolvedValue(2);

    await ungVienDaXem(req, res);

    expect(XemUv.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
      { $skip: 4 }, // (3 - 1) * 2
      { $limit: 2 },
    ]));
    expect(functions.success).toHaveBeenCalled();
  });
});
