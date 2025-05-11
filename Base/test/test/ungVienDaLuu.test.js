const { ungVienDaLuu } = require('../controllers/vieclamtheogio/manageAccountCompany');
const NtdSaveUv = require('../models/ViecLamTheoGio/NtdSaveUv');
const NtdXemUv = require('../models/ViecLamTheoGio/NtdXemUv');
const functions = require('../services/functions');

jest.mock('../models/ViecLamTheoGio/NtdSaveUv');
jest.mock('../models/ViecLamTheoGio/NtdXemUv');
jest.mock('../services/functions', () => ({
  findCount: jest.fn(),
  success: jest.fn(),
  setError: jest.fn()
}));

describe('ungVienDaLuu controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        page: 1,
        pageSize: 6
      },
      user: {
        data: { _id: 123 }
      }
    };
    res = {};
    jest.clearAllMocks();
  });

  test('UVDL_TC01 - Trả về danh sách ứng viên đã lưu thành công, chưa xem', async () => {
    const mockData = [
      {
        id: 1,
        id_ntd: 123,
        id_uv: 456,
        created_at: new Date(),
        uv_userName: 'Nguyen Van A',
        uv_city: 'Hà Nội',
        uv_address: '123 Đường A',
        uv_phone: '0987654321',
        uv_birthday: '1990-01-01',
        uv_day: 'Monday'
      }
    ];

    NtdSaveUv.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(1);
    NtdXemUv.findOne.mockResolvedValue(null);

    await ungVienDaLuu(req, res);

    // check gọi findCount đúng
    expect(functions.findCount).toHaveBeenCalledWith(NtdSaveUv, { id_ntd: 123 });

    // check uv_phone bị cắt
    expect(mockData[0].uv_phone).toBe('0987');
    expect(mockData[0].check_xem_uv).toBe(false);

    expect(functions.success).toHaveBeenCalledWith(res, 'danh sach ung vien moi ung tuyen', {
      total: 1,
      data: mockData
    });
  });

  test('UVDL_TC02 - Trả về danh sách đã xem (check_xem_uv: true)', async () => {
    const mockData = [
      {
        id: 2,
        id_ntd: 123,
        id_uv: 789,
        created_at: new Date(),
        uv_userName: 'Tran Thi B',
        uv_city: 'HCM',
        uv_address: '456 Đường B',
        uv_phone: '0999888777',
        uv_birthday: '1992-02-02',
        uv_day: 'Tuesday'
      }
    ];

    NtdSaveUv.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(1);
    NtdXemUv.findOne.mockResolvedValue({ id_uv: 789 });

    await ungVienDaLuu(req, res);

    expect(mockData[0].check_xem_uv).toBe(true);
    expect(mockData[0].uv_phone).toBe('0999888777'); // không bị cắt
    expect(functions.success).toHaveBeenCalled();
  });

  test('UVDL_TC03 - Không có page và pageSize truyền vào', async () => {
    delete req.body.page;
    delete req.body.pageSize;

    const mockData = [];

    NtdSaveUv.aggregate.mockResolvedValue(mockData);
    functions.findCount.mockResolvedValue(0);
    NtdXemUv.findOne.mockResolvedValue(null);

    await ungVienDaLuu(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, 'danh sach ung vien moi ung tuyen', {
      total: 0,
      data: []
    });
  });

  test('UVDL_TC04 - Xảy ra lỗi trong quá trình xử lý', async () => {
    const errorMsg = 'MongoDB connection error';
    NtdSaveUv.aggregate.mockRejectedValue(new Error(errorMsg));

    await ungVienDaLuu(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, errorMsg);
  });
});
