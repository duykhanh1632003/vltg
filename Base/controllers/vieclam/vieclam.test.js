const { danhSachViecLam } = require('../vieclamtheogio/viecLam');
const ViecLam = require('../../models/ViecLamTheoGio/ViecLam');
const UngTuyen = require('../../models/ViecLamTheoGio/UngTuyen');
const UvSaveVl = require('../../models/ViecLamTheoGio/UvSaveVl');
const City2 = require('../../models/ViecLamTheoGio/City2');
const JobCategory = require('../../models/ViecLamTheoGio/JobCategory');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/ViecLam');
jest.mock('../../models/ViecLamTheoGio/UngTuyen');
jest.mock('../../models/ViecLamTheoGio/UvSaveVl');
jest.mock('../../models/ViecLamTheoGio/City2');
jest.mock('../../models/ViecLamTheoGio/JobCategory');
jest.mock('../../services/functions');

const mockUser = { data: { _id: 666 } };

describe('danhSachViecLam - service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('TC01 - Lọc theo từ khóa', async () => {
    const mockJob = {
      id_vieclam: 1,
      vi_tri: 'Nhân viên Java',
      nganh_nghe: '123',
      luong_first: 1500,
      luong_last: 2500,
      muc_luong: '1500-2500',
    };

    ViecLam.aggregate.mockResolvedValue([mockJob]);

    const req = {
      body: { key: 'Java' },
      user: mockUser,
    };

    functions.convertTimestamp.mockReturnValue(100000);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await danhSachViecLam(req, res);

    expect(ViecLam.aggregate).toHaveBeenCalled();
  });

  it('TC02 - Lọc theo id_vieclam chi tiết', async () => {
    const viecLam = {
      id_vieclam: 123,
      nganh_nghe: '1, 2',
      id_ntd: 10,
      luot_xem: 5,
    };

    ViecLam.findOne.mockResolvedValue(viecLam);
    ViecLam.findOneAndUpdate.mockResolvedValue({ ...viecLam, luot_xem: 6 });
    ViecLam.aggregate.mockResolvedValue([]);

    // Sửa ở đây để hỗ trợ .lean()
    JobCategory.findOne.mockReturnValue({
      lean: () => Promise.resolve({ jc_id: 1, jc_name: 'IT' }),
    });

    UngTuyen.distinct.mockResolvedValue(['123']);
    UvSaveVl.findOne.mockResolvedValue({ id_uv: 666, id_viec: 123 });

    const req = {
      body: { id_vieclam: 123 },
      user: mockUser,
    };

    functions.convertTimestamp.mockReturnValue(100000);
    functions.getLinkFile.mockReturnValue('https://image.com/avatar.jpg');

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await danhSachViecLam(req, res);

    expect(ViecLam.findOne).toHaveBeenCalledWith({ id_vieclam: 123 });
  });

  it('TC03 - Lọc theo city', async () => {
    City2.findOne.mockResolvedValue({ cit_id: 1, cit_name: 'Hà Nội' });
    ViecLam.aggregate.mockResolvedValue([]);

    const req = {
      body: { city: '1' },
      user: mockUser,
    };

    functions.convertTimestamp.mockReturnValue(100000);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await danhSachViecLam(req, res);

    expect(City2.findOne).toHaveBeenCalledWith({ cit_id: 1, cit_parent: 0 });
    expect(ViecLam.aggregate).toHaveBeenCalled();
  });

  it('TC04 - Trả lỗi nếu không tìm thấy việc làm', async () => {
    ViecLam.findOne.mockResolvedValue(null);

    const req = {
      body: { id_vieclam: 999 },
      user: mockUser,
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    functions.setError = jest.fn();

    await danhSachViecLam(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Viec lam not found!', 404);
  });

  it('TC05 - Lọc theo tag', async () => {
    // Sửa ở đây để hỗ trợ .lean()
    JobCategory.findOne.mockReturnValue({
      lean: () => Promise.resolve({ jc_id: 10, jc_name: 'Kế toán' }),
    });

    ViecLam.aggregate.mockResolvedValue([]);

    const req = {
      body: { tag: '10' },
      user: mockUser,
    };

    functions.convertTimestamp.mockReturnValue(100000);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await danhSachViecLam(req, res);

    expect(JobCategory.findOne).toHaveBeenCalledWith({ jc_id: 10 });
    expect(ViecLam.aggregate).toHaveBeenCalled();
  });
});
