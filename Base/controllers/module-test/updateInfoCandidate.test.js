const { updateInfoCandidate } = require('../vieclamtheogio/manageAccountCandidate');
const Users = require('../../models/ViecLamTheoGio/Users');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../services/functions', () => ({
  convertTimestamp: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
  checkPhoneNumber: jest.fn(),
  checkDate: jest.fn(),
}));

describe('Unit Test - updateInfoCandidate', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 123 } },
      body: {
        userName: 'Nguyen Van A',
        phone: '0123456789',
        city: 1,
        email: 'test@example.com',
        district: 2,
        address: '123 Street',
        birthday: '2000-01-01',
        gender: 1,
        married: 0,
      },
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Thành công khi đầy đủ dữ liệu và hợp lệ', async () => {
    functions.checkPhoneNumber.mockReturnValue(true);
    functions.checkDate.mockReturnValue(true);
    functions.convertTimestamp.mockReturnValueOnce(946684800); // birthday
    functions.convertTimestamp.mockReturnValueOnce(1713273600); // now
    Users.findOneAndUpdate.mockResolvedValue({ _id: 123 });

    await updateInfoCandidate(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalledWith(res, 'Cap nhat thong tin thanh cong!');
  });

  test('TC02 - Thiếu 1 trong các field quan trọng', async () => {
    delete req.body.phone;

    await updateInfoCandidate(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input value!', 400);
  });

  test('TC03 - Số điện thoại sai định dạng', async () => {
    functions.checkPhoneNumber.mockReturnValue(false);
    functions.checkDate.mockReturnValue(true);

    await updateInfoCandidate(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Invalid phone number or invalid date!', 400);
  });

  test('TC04 - Ngày sinh sai định dạng', async () => {
    functions.checkPhoneNumber.mockReturnValue(true); // Đảm bảo qua được checkPhone
    functions.checkDate.mockReturnValue(false);       // Sai định dạng ngày sinh
  
    await updateInfoCandidate(req, res);
  
    expect(functions.setError).toHaveBeenCalledWith(res, 'Invalid phone number or invalid date!', 400);
  });
  

  test('TC05 - Không tìm thấy người dùng', async () => {
    functions.checkPhoneNumber.mockReturnValue(true);
    functions.checkDate.mockReturnValue(true);
    functions.convertTimestamp.mockReturnValueOnce(946684800);
    functions.convertTimestamp.mockReturnValueOnce(1713273600);
    Users.findOneAndUpdate.mockResolvedValue(null);

    await updateInfoCandidate(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Nha tuyen dung not found!', 404);
  });

  test('TC06 - Không gửi gender hoặc married (default về 0)', async () => {
    delete req.body.gender;
    delete req.body.married;

    functions.checkPhoneNumber.mockReturnValue(true);
    functions.checkDate.mockReturnValue(true);
    functions.convertTimestamp.mockReturnValueOnce(946684800);
    functions.convertTimestamp.mockReturnValueOnce(1713273600);
    Users.findOneAndUpdate.mockResolvedValue({ _id: 123 });

    await updateInfoCandidate(req, res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 123, type: 0 }),
      expect.objectContaining({
        gender: 0,
        married: 0,
      }),
      expect.anything()
    );
    expect(functions.success).toHaveBeenCalledWith(res, 'Cap nhat thong tin thanh cong!');
  });

  test('TC07 - Ném lỗi trong try', async () => {
    functions.checkPhoneNumber.mockReturnValue(true);
    functions.checkDate.mockReturnValue(true);
    functions.convertTimestamp.mockReturnValue(123456789);
    Users.findOneAndUpdate.mockRejectedValue(new Error('DB Error'));

    await updateInfoCandidate(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB Error');
  });
});
