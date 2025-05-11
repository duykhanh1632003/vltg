const { updateInfo } = require('../vieclamtheogio/manageAccountCandidate');
const Users = require('../../models/ViecLamTheoGio/Users');
const UvCvmm = require('../../models/ViecLamTheoGio/UvCvmm');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../models/ViecLamTheoGio/UvCvmm');
jest.mock('../../services/functions', () => ({
  convertTimestamp: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
  checkEmail: jest.fn(),
  checkDate: jest.fn(),
}));

describe('Unit Test - updateInfo', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 1 } },
      body: {
        email: 'test@example.com',
        gender: 1,
        birthday: '2000-01-01',
        city: 'HCM',
        district: '1',
        cong_viec: 'Dev',
        dia_diem: ['HCM'],
        nganh_nghe: ['CNTT'],
        day: ['T2', 'T3']
      }
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Gửi đủ các field hợp lệ', async () => {
    functions.checkEmail.mockReturnValue(true);
    functions.checkDate.mockReturnValue(true);
    functions.convertTimestamp.mockReturnValue(123456789);
    Users.findOne.mockResolvedValue(null); // email chưa tồn tại
    Users.findOneAndUpdate.mockResolvedValue({ _id: 1 });
    UvCvmm.findOneAndUpdate.mockResolvedValue({ id_uv_cvmm: 1 });

    await updateInfo(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, 'Cap nhat thong tin thanh cong!');
  });

  test('TC02 - Thiếu 1 field bắt buộc', async () => {
    delete req.body.email;

    await updateInfo(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input value!', 400);
  });

  test('TC03 - Email không hợp lệ', async () => {
    functions.checkEmail.mockReturnValue(false);

    await updateInfo(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Invalid phone number or invalid date!', 400);
  });

  test('TC04 - Ngày sinh sai định dạng', async () => {
    functions.checkEmail.mockReturnValue(true);
    functions.checkDate.mockReturnValue(false);

    await updateInfo(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Invalid phone number or invalid date!', 400);
  });

  test('TC05 - Email đã tồn tại', async () => {
    functions.checkEmail.mockReturnValue(true);
    functions.checkDate.mockReturnValue(true);
    Users.findOne.mockResolvedValue({ _id: 99 }); // user khác đã có email này

    await updateInfo(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Email da ton tai', 404);
  });

  test('TC06 - id_uv sai (không tìm thấy user)', async () => {
    functions.checkEmail.mockReturnValue(true);
    functions.checkDate.mockReturnValue(true);
    Users.findOne.mockResolvedValue(null); // check email
    Users.findOneAndUpdate.mockResolvedValue(null);

    await updateInfo(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Ung vien not found!', 404);
  });

  test('TC07 - UvCvmm chưa có', async () => {
    functions.checkEmail.mockReturnValue(true);
    functions.checkDate.mockReturnValue(true);
    functions.convertTimestamp.mockReturnValue(123456789);
    Users.findOne.mockResolvedValue(null);
    Users.findOneAndUpdate.mockResolvedValue({ _id: 1 });
    UvCvmm.findOneAndUpdate.mockResolvedValue(null);

    await updateInfo(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'cvmm not found!', 404);
  });

  test('TC08 - Lỗi trong try', async () => {
    functions.checkEmail.mockReturnValue(true);
    functions.checkDate.mockReturnValue(true);
    Users.findOne.mockRejectedValue(new Error('DB error'));

    await updateInfo(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB error');
  });
});
