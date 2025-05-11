// File: test/danhSachTinTuyenDungMoi.test.js

const functions = require('../services/functions');
const ViecLam = require('../models/ViecLamTheoGio/ViecLam');
const { danhSachTinTuyenDungMoi } = require('../controllers/vieclamtheogio/manageAccountCompany');  // Giả sử đây là hàm controller của bạn

// Mock các hàm trong services
jest.mock('../models/ViecLamTheoGio/ViecLam');
jest.mock('../services/functions');

describe('danhSachTinTuyenDungMoi', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'ntd123', type: 1 } }, // Giả lập người dùng có type = 1
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    functions.convertTimestamp.mockReturnValue(1700000000); // Giả lập timestamp cố định
  });

  it('should return error if user type is not 1', async () => {
    req.user.data.type = 0;  // Giả lập người dùng có type = 0 (không hợp lệ)

    await danhSachTinTuyenDungMoi(req, res, next);

    // Kiểm tra xem hàm setError đã được gọi với mã lỗi 403 và thông báo đúng
    expect(functions.setError).toHaveBeenCalledWith(res, "Not company", 403);
  });

  it('should return the latest job postings when user has valid access rights (type = 1)', async () => {
    req.user.data.type = 1; // Giả lập người dùng có type = 1 (hợp lệ)
    req.body = { page: 1, pageSize: 2 };

    const fakeData = [
      { id_vieclam: 1, vi_tri: 'IT', vl_created_time: 1700000001, time_td: 1700005000 },
      { id_vieclam: 2, vi_tri: 'Kế toán', vl_created_time: 1699999999, time_td: 1699990000 }
    ];

    // Mock model find method
    ViecLam.find.mockReturnValueOnce({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(fakeData)
    });

    // Mock hàm success
    functions.success.mockImplementation((res, msg, data) => {
      return res.json({ msg, data }); // Trả về kết quả giả lập cho hàm success
    });

    // Gọi hàm
    await danhSachTinTuyenDungMoi(req, res, next);

    // Kiểm tra hàm success có được gọi đúng với tham số mong đợi
    expect(functions.success).toHaveBeenCalledWith(res, "Danh sach tin tuyen dung moi nhat", {
      data: fakeData
    });
  });
});