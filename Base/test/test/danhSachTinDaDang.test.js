const { danhSachTinDaDang } = require('../controllers/vieclamtheogio/manageAccountCompany');
const functions = require('../services/functions');
const ViecLam = require('../models/ViecLamTheoGio/ViecLam');
const JobCategory = require('../models/ViecLamTheoGio/JobCategory');
const UngTuyen = require('../models/ViecLamTheoGio/UngTuyen');

jest.mock('../services/functions', () => ({
  findCount: jest.fn(),
  pageFindWithFields: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

jest.mock('../models/ViecLamTheoGio/ViecLam');
jest.mock('../models/ViecLamTheoGio/JobCategory');
jest.mock('../models/ViecLamTheoGio/UngTuyen');

describe('Unit Test - danhSachTinDaDang', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        page: 2,
        pageSize: 5,
      },
      user: {
        data: { _id: 123 },
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test('DSTDD_TC01 - Mặc định page và pageSize nếu không truyền', async () => {
    delete req.body.page;
    delete req.body.pageSize;

    functions.findCount.mockResolvedValue(0);
    functions.pageFindWithFields.mockResolvedValue([]);

    await danhSachTinDaDang(req, res);

    expect(functions.findCount).toHaveBeenCalledWith(ViecLam, { id_ntd: 123 });
    expect(functions.pageFindWithFields).toHaveBeenCalledWith(
      ViecLam,
      { id_ntd: 123 },
      {
        id_vieclam: 1,
        vi_tri: 1,
        alias: 1,
        dia_diem: 1,
        nganh_nghe: 1,
        luot_xem: 1,
        time_td: 1,
        fist_time: 1,
        last_time: 1,
        active: 1,
      },
      { time_td: -1 },
      0,
      6
    );
    expect(functions.success).toHaveBeenCalledWith(res, 'danh sach tin da dang', {
      total: 0,
      data: [],
    });
  });

  test('DSTDD_TC02 - Có truyền id_viec -> lọc theo id_vieclam', async () => {
    req.body.id_viec = 999;
    functions.findCount.mockResolvedValue(1);
    functions.pageFindWithFields.mockResolvedValue([]);

    await danhSachTinDaDang(req, res);

    expect(functions.findCount).toHaveBeenCalledWith(ViecLam, {
      id_ntd: 123,
      id_vieclam: 999,
    });
  });

  test('DSTDD_TC03 - Lấy danh sách việc làm, có ngành nghề và ứng tuyển', async () => {
    const mockJobs = [
      {
        id_vieclam: 1,
        vi_tri: 'Phục vụ',
        nganh_nghe: '101',
      },
    ];

    functions.findCount.mockResolvedValue(1);
    functions.pageFindWithFields.mockResolvedValue(mockJobs);

    JobCategory.findOne.mockResolvedValue({ jc_id: 101, jc_name: 'Dịch vụ' });
    UngTuyen.distinct.mockResolvedValue([1, 2, 3]);

    await danhSachTinDaDang(req, res);

    expect(JobCategory.findOne).toHaveBeenCalledWith(
      { jc_id: 101 },
      { jc_id: 1, jc_name: 1 }
    );
    expect(UngTuyen.distinct).toHaveBeenCalledWith('id_viec', {
      id_viec: 1,
    });
    expect(functions.success).toHaveBeenCalledWith(res, 'danh sach tin da dang', {
      total: 1,
      data: [
        {
          id_vieclam: 1,
          vi_tri: 'Phục vụ',
          nganh_nghe: '101',
          nganhNghe: { jc_id: 101, jc_name: 'Dịch vụ' },
          totalUngTuyen: 3,
        },
      ],
    });
  });

  test('DSTDD_TC04 - Không tìm thấy ngành nghề', async () => {
    const mockJobs = [{ id_vieclam: 2, nganh_nghe: '102' }];
    functions.findCount.mockResolvedValue(1);
    functions.pageFindWithFields.mockResolvedValue(mockJobs);
    JobCategory.findOne.mockResolvedValue(null);
    UngTuyen.distinct.mockResolvedValue([]);

    await danhSachTinDaDang(req, res);

    expect(mockJobs[0].nganhNghe).toBeUndefined();
    expect(mockJobs[0].totalUngTuyen).toBe(0);
    expect(functions.success).toHaveBeenCalled();
  });

  test('DSTDD_TC05 - Lỗi trong try catch → setError được gọi', async () => {
    functions.findCount.mockRejectedValue(new Error('DB connection failed'));

    await danhSachTinDaDang(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB connection failed');
  });

  test('DSTDD_TC06 - Không có kết quả tìm kiếm trong pageFindWithFields', async () => {
    functions.findCount.mockResolvedValue(0);
    functions.pageFindWithFields.mockResolvedValue([]);

    await danhSachTinDaDang(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'No data found', 404);
  });

  // test('TC07 - Trường hợp không có ứng tuyển cho công việc', async () => {
  //   const mockJobs = [
  //     {
  //       id_vieclam: 1,
  //       vi_tri: 'Phục vụ',
  //       nganh_nghe: '101',
  //     },
  //   ];

  //   functions.findCount.mockResolvedValue(1);
  //   functions.pageFindWithFields.mockResolvedValue(mockJobs);
  //   JobCategory.findOne.mockResolvedValue({ jc_id: 101, jc_name: 'Dịch vụ' });
  //   UngTuyen.distinct.mockResolvedValue([]);

  //   await danhSachTinDaDang(req, res);

  //   expect(mockJobs[0].totalUngTuyen).toBe(0);
  //   expect(functions.success).toHaveBeenCalled();
  // });
});
