const { getCongViecMongMuon } = require('../vieclamtheogio/manageAccountCandidate');
const UvCvmm = require('../../models/ViecLamTheoGio/UvCvmm');
const JobCategory = require('../../models/ViecLamTheoGio/JobCategory');
const City2 = require('../../models/ViecLamTheoGio/City2');

jest.mock('../../models/ViecLamTheoGio/UvCvmm');
jest.mock('../../models/ViecLamTheoGio/JobCategory');
jest.mock('../../models/ViecLamTheoGio/City2');

describe('Unit Test - getCongViecMongMuon', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        data: {
          _id: 123,
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('TC01 - Thiếu userId', async () => {
    req.user = null;

    await getCongViecMongMuon(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      data: { message: 'Missing user ID' },
    });
  });

  test('TC02 - Không tìm thấy uvCvmm', async () => {
    UvCvmm.findOne.mockResolvedValue(null);

    await getCongViecMongMuon(req, res);

    expect(UvCvmm.findOne).toHaveBeenCalledWith({ id_uv_cvmm: 123 });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      data: { message: 'Không tìm thấy thông tin công việc mong muốn' },
    });
  });

  test('TC03 - Dữ liệu hợp lệ nhưng nganh_nghe & dia_diem là chuỗi rỗng', async () => {
    const uvData = {
      id_uv_cvmm: 123,
      nganh_nghe: '',
      dia_diem: '',
      toObject: () => ({
        id_uv_cvmm: 123,
        nganh_nghe: '',
        dia_diem: '',
      }),
    };

    UvCvmm.findOne.mockResolvedValue(uvData);

    JobCategory.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    });

    City2.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    });

    await getCongViecMongMuon(req, res);

    expect(JobCategory.find).toHaveBeenCalledWith({ jc_id: { $in: [] } }, { _id: 0, jc_name: 1 });
    expect(City2.find).toHaveBeenCalledWith({ cit_id: { $in: [] } }, { _id: 0, cit_name: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        message: 'get info cong viec mong muon thanh cong',
        data: {
          ...uvData.toObject(),
          name_job: [],
          name_city: [],
        },
      },
    });
  });

  test('TC04 - Dữ liệu đầy đủ và hợp lệ', async () => {
    const uvData = {
      id_uv_cvmm: 123,
      nganh_nghe: '1,2',
      dia_diem: '3,4',
      toObject: () => ({
        id_uv_cvmm: 123,
        nganh_nghe: '1,2',
        dia_diem: '3,4',
      }),
    };

    UvCvmm.findOne.mockResolvedValue(uvData);

    JobCategory.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ jc_name: 'IT' }, { jc_name: 'Kế toán' }]),
    });

    City2.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ cit_name: 'HN' }, { cit_name: 'TPHCM' }]),
    });

    await getCongViecMongMuon(req, res);

    expect(JobCategory.find).toHaveBeenCalledWith({ jc_id: { $in: [1, 2] } }, { _id: 0, jc_name: 1 });
    expect(City2.find).toHaveBeenCalledWith({ cit_id: { $in: [3, 4] } }, { _id: 0, cit_name: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        message: 'get info cong viec mong muon thanh cong',
        data: {
          ...uvData.toObject(),
          name_job: ['IT', 'Kế toán'],
          name_city: ['HN', 'TPHCM'],
        },
      },
    });
  });

  test('TC05 - Lỗi bất ngờ (mock throw)', async () => {
    UvCvmm.findOne.mockRejectedValue(new Error('DB error'));

    await getCongViecMongMuon(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        message: 'Lỗi server khi lấy thông tin công việc mong muốn',
      },
    });
  });
});
