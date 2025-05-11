const { updateInfoCompany } = require('../controllers/vieclamtheogio/manageAccountCompany'); // cập nhật đúng path
const Users = require('../models/ViecLamTheoGio/Users');
const functions = require('../services/functions');

jest.mock('../models/ViecLamTheoGio/Users');
jest.mock('../services/functions', () => ({
  convertTimestamp: jest.fn(),
  checkPhoneNumber: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('updateInfoCompany - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 123 } },
      body: {
        userName: 'Công ty ABC',
        phone: '0912345678',
        city: 1,
        district: 2,
        address: '123 ABC St',
        description: 'Mô tả công ty',
        com_size: '50-100',
        usc_name: 'Nguyễn Văn A',
        usc_name_add: 'Hà Nội',
        usc_name_phone: '0987654321',
        usc_name_email: 'ntd@example.com',
        usc_mst: '123456789',
        usc_website: 'https://abc.com'
      }
    };
    res = {};
    jest.clearAllMocks();
  });

  test('UIC_TC01 - Cập nhật thành công', async () => {
    functions.convertTimestamp.mockReturnValue(1111111111);
    functions.checkPhoneNumber.mockResolvedValue(true);
    Users.findOneAndUpdate.mockResolvedValue({ _id: 123 });

    await updateInfoCompany(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, 'Cap nhat thong tin thanh cong!');
  });

  test('UIC_TC02 - Thiếu userName => lỗi thiếu input', async () => {
    delete req.body.userName;

    await updateInfoCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input value!', 400);
  });

  test('UIC_TC03 - Thiếu usc_name_phone => lỗi thiếu input', async () => {
    delete req.body.usc_name_phone;

    await updateInfoCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input value!', 400);
  });

  test('UIC_TC04 - SĐT chính không hợp lệ => lỗi số điện thoại', async () => {
    functions.checkPhoneNumber
      .mockResolvedValueOnce(false) // phone
      .mockResolvedValueOnce(true); // usc_name_phone

    await updateInfoCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Invalid phone number!', 400);
  });

  test('UIC_TC05 - SĐT người liên hệ không hợp lệ => lỗi số điện thoại', async () => {
    functions.checkPhoneNumber
      .mockResolvedValueOnce(true) // phone
      .mockResolvedValueOnce(false); // usc_name_phone

    await updateInfoCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Invalid phone number!', 400);
  });

  test('UIC_TC06 - Không tìm thấy nhà tuyển dụng => lỗi 404', async () => {
    functions.convertTimestamp.mockReturnValue(1111111111);
    functions.checkPhoneNumber.mockResolvedValue(true);
    Users.findOneAndUpdate.mockResolvedValue(null);

    await updateInfoCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Nha tuyen dung not found!', 404);
  });

  test('UIC_TC07 - Gây lỗi trong try-catch => trả về lỗi', async () => {
    functions.convertTimestamp.mockReturnValue(1111111111);
    functions.checkPhoneNumber.mockResolvedValue(true);
    Users.findOneAndUpdate.mockRejectedValue(new Error('DB error'));

    await updateInfoCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB error');
  });
});
