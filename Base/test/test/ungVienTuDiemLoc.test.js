const { ungVienTuDiemLoc } = require('../controllers/vieclamtheogio/manageAccountCompany');
const NtdXemUv = require('../models/ViecLamTheoGio/NtdXemUv');
const functions = require('../services/functions');

jest.mock('../models/ViecLamTheoGio/NtdXemUv');
jest.mock('../services/functions', () => ({
  findCount: jest.fn(),
  success: jest.fn(),
  setError: jest.fn()
}));

describe('Controller: ungVienTuDiemLoc', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 1 } },
      body: {}
    };
    res = {};
    jest.clearAllMocks();
  });

  test('UVTDL_TC01 - Thành công khi truyền đủ dữ liệu', async () => {
    req.body = { page: 2, pageSize: 3 };
    const expectedData = [{ id_uv: 123 }];
    NtdXemUv.aggregate.mockResolvedValue(expectedData);
    functions.findCount.mockResolvedValue(10);

    await ungVienTuDiemLoc(req, res);

    expect(NtdXemUv.aggregate).toHaveBeenCalledWith(expect.any(Array));
    expect(functions.findCount).toHaveBeenCalledWith(NtdXemUv, { id_ntd: 1 });
    expect(functions.success).toHaveBeenCalledWith(res, 'danh sach ung vien moi ung tuyen', {
      total: 10,
      data: expectedData
    });
  });

  test('UVTDL_TC02 - Mặc định page và pageSize nếu không có', async () => {
    const result = [{ id_uv: 321 }];
    NtdXemUv.aggregate.mockResolvedValue(result);
    functions.findCount.mockResolvedValue(5);

    await ungVienTuDiemLoc(req, res);

    expect(NtdXemUv.aggregate).toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalledWith(res, expect.any(String), {
      total: 5,
      data: result
    });
  });

  test('UVTDL_TC03 - Truyền thêm điều kiện ket_qua', async () => {
    req.body = { ket_qua: 1, page: 1, pageSize: 5 };
    NtdXemUv.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(2);

    await ungVienTuDiemLoc(req, res);

    expect(NtdXemUv.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $match: { id_ntd: 1, ket_qua: 1 } })
      ])
    );
    expect(functions.findCount).toHaveBeenCalledWith(NtdXemUv, { id_ntd: 1, ket_qua: 1 });
  });

  test('UVTDL_TC04 - Xử lý lỗi từ aggregate', async () => {
    const error = new Error('Database error');
    NtdXemUv.aggregate.mockRejectedValue(error);

    await ungVienTuDiemLoc(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, error.message);
  });

  // test('TC05 - Bị lỗi do thiếu user (req.user)', async () => {
  //   req = { body: {} };
  //   NtdXemUv.aggregate.mockImplementation(() => {
  //     throw new Error('Cannot read properties of undefined');
  //   });

  //   await ungVienTuDiemLoc(req, res);

  //   expect(functions.setError).toHaveBeenCalledWith(res, 'Cannot read properties of undefined');
  // });

  test('UVTDL_TC06 - Không có dữ liệu trả về (empty)', async () => {
    NtdXemUv.aggregate.mockResolvedValue([]);
    functions.findCount.mockResolvedValue(0);

    await ungVienTuDiemLoc(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, expect.any(String), {
      total: 0,
      data: [],
    });
  });

  test('UVTDL_TC07 - Lỗi server khi gọi findCount (ví dụ lỗi DB)', async () => {
    req.body = { page: 1, pageSize: 3 };
    NtdXemUv.aggregate.mockResolvedValue([{ id_uv: 999 }]);
    functions.findCount.mockRejectedValue(new Error('MongoDB connection error'));
  
    await ungVienTuDiemLoc(req, res);
  
    expect(functions.setError).toHaveBeenCalledWith(res, 'MongoDB connection error');
  });
});
