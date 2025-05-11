const { updateCongViecMongMuon } = require('../vieclamtheogio/manageAccountCandidate');
const Users = require('../../models/ViecLamTheoGio/Users');
const UvCvmm = require('../../models/ViecLamTheoGio/UvCvmm');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../models/ViecLamTheoGio/UvCvmm');
jest.mock('../../services/functions', () => ({
  convertTimestamp: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - updateCongViecMongMuon', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 123 } },
      body: {},
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Thiếu input: nganh_nghe và dia_diem là []', async () => {
    req.body = {
      cong_viec: 'Developer',
      nganh_nghe: [],
      dia_diem: [],
    };

    await updateCongViecMongMuon(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input value!', 405);
  });

  test('TC02 - User không tồn tại', async () => {
    req.body = {
      cong_viec: 'Dev',
      nganh_nghe: ['1'],
      dia_diem: ['2'],
      cap_bac: 'Junior',
      hinh_thuc: 'Full-time',
      luong: '10M',
    };

    functions.convertTimestamp.mockReturnValue(123456789);
    Users.findOneAndUpdate.mockResolvedValue(null);

    await updateCongViecMongMuon(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 123, type: 0 },
      { updatedAt: 123456789 },
      { new: true }
    );
    expect(functions.setError).toHaveBeenCalledWith(res, 'user not found!', 404);
  });

  test('TC03 - User tồn tại, nhưng uvCvmm cập nhật thất bại (null)', async () => {
    req.body = {
      cong_viec: 'Tester',
      nganh_nghe: ['1'],
      dia_diem: ['2'],
      cap_bac: 'Middle',
      hinh_thuc: 'Part-time',
      luong: '7M',
    };

    functions.convertTimestamp.mockReturnValue(123456789);
    Users.findOneAndUpdate.mockResolvedValue({ _id: 123 });
    UvCvmm.findOneAndUpdate.mockResolvedValue(null);

    await updateCongViecMongMuon(req, res);

    expect(UvCvmm.findOneAndUpdate).toHaveBeenCalledWith(
      { id_uv_cvmm: 123 },
      {
        cong_viec: 'Tester',
        nganh_nghe: '1',
        dia_diem: '2',
        lever: 'Middle',
        hinh_thuc: 'Part-time',
        luong: '7M',
      },
      { new: true, upsert: true }
    );
    expect(functions.setError).toHaveBeenCalledWith(res, 'Update cvmm fail!', 406);
  });

  test('TC04 - Update thành công', async () => {
    req.body = {
      cong_viec: 'QA',
      nganh_nghe: ['5', '6'],
      dia_diem: ['3', '7'],
      cap_bac: 'Senior',
      hinh_thuc: 'Remote',
      luong: '15M',
    };

    functions.convertTimestamp.mockReturnValue(987654321);
    const mockUser = { _id: 123 };
    const mockUvCvmm = { id_uv_cvmm: 123, cong_viec: 'QA' };

    Users.findOneAndUpdate.mockResolvedValue(mockUser);
    UvCvmm.findOneAndUpdate.mockResolvedValue(mockUvCvmm);

    await updateCongViecMongMuon(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, 'Update cvmm success!', { uvCvmm: mockUvCvmm });
  });

  test('TC05 - Lỗi trong Users.findOneAndUpdate()', async () => {
    req.body = {
      cong_viec: 'DevOps',
      nganh_nghe: ['8'],
      dia_diem: ['9'],
      cap_bac: 'Mid',
      hinh_thuc: 'Full-time',
      luong: '12M',
    };

    functions.convertTimestamp.mockReturnValue(111111111);
    Users.findOneAndUpdate.mockRejectedValue(new Error('DB error in Users'));

    await updateCongViecMongMuon(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB error in Users');
  });

  test('TC06 - Lỗi trong UvCvmm.findOneAndUpdate()', async () => {
    req.body = {
      cong_viec: 'BA',
      nganh_nghe: ['10'],
      dia_diem: ['11'],
      cap_bac: 'Lead',
      hinh_thuc: 'Hybrid',
      luong: '20M',
    };

    functions.convertTimestamp.mockReturnValue(222222222);
    Users.findOneAndUpdate.mockResolvedValue({ _id: 123 });
    UvCvmm.findOneAndUpdate.mockRejectedValue(new Error('DB error in UV'));

    await updateCongViecMongMuon(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB error in UV');
  });
});
