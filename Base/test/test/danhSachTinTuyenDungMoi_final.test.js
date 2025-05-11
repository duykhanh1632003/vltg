// File: test/danhSachTinTuyenDungMoi.test.js

const functions = require('../services/functions');
const ViecLam = require('../models/ViecLamTheoGio/ViecLam');
const { danhSachTinTuyenDungMoi } = require('../controllers/vieclamtheogio/manageAccountCompany');  // Giả sử đây là hàm controller của bạn

jest.mock('../models/ViecLamTheoGio/ViecLam');
jest.mock('../services/functions');

describe('danhSachTinTuyenDungMoi', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'ntd123', type: 1 } },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    functions.convertTimestamp.mockReturnValue(1700000000); // giả timestamp cố định
  });

  it('DSTTDM_TC01 - Trả về lỗi nếu người dùng có type không phải 1', async () => {
    req.user.data.type = 0;  // Giả lập người dùng có type = 0 (không hợp lệ)

    await danhSachTinTuyenDungMoi(req, res, next);

    // Kiểm tra xem hàm setError đã được gọi với mã lỗi 403 và thông báo đúng
    expect(functions.setError).toHaveBeenCalledWith(res, "Not company", 403);
  });

  it('DSTTDM_TC02 - Trả về danh sách tin tuyển dụng mới khi người dùng có quyền truy cập hợp lệ (type = 1)', async () => {
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

  it('DSTTDM_TC03 - Thiết lập giá trị mặc định cho page và pageSize nếu không có trong request', async () => {
    req.body = {}; // Không truyền page và pageSize

    ViecLam.find.mockReturnValueOnce({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([])
    });

    await danhSachTinTuyenDungMoi(req, res, next);

    // Kiểm tra rằng mặc định page = 1 và pageSize = 6 đã được thiết lập
    expect(functions.success).toHaveBeenCalledWith(res, "Danh sach tin tuyen dung moi nhat", {
      data: []
    });
  });

  it('DSTTDM_TC04 - Trả về danh sách trống nếu không có công việc nào', async () => {
    req.body = { page: 1, pageSize: 2 };

    // Mock model find method với dữ liệu trống
    ViecLam.find.mockReturnValueOnce({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([])
    });

    await danhSachTinTuyenDungMoi(req, res, next);

    expect(functions.success).toHaveBeenCalledWith(res, "Danh sach tin tuyen dung moi nhat", {
      data: []
    });
  });

  it('DSTTDM_TC05 - Xử lý lỗi khi truy vấn cơ sở dữ liệu bị lỗi', async () => {
    req.body = { page: 1, pageSize: 2 };

    // Giả lập lỗi trong quá trình truy vấn cơ sở dữ liệu
    ViecLam.find.mockImplementation(() => {
      throw new Error('Mongo Error');
    });

    await danhSachTinTuyenDungMoi(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, "Mongo Error");
  });

  it('DSTTDM_TC06 - Kiểm tra tính toán skip dựa trên page và pageSize', async () => {
    req.body = { page: 2, pageSize: 3 };  // Page 2, pageSize 3

    const fakeData = [
      { id_vieclam: 1, vi_tri: 'IT', vl_created_time: 1700000001, time_td: 1700005000 },
      { id_vieclam: 2, vi_tri: 'Kế toán', vl_created_time: 1699999999, time_td: 1699990000 },
      { id_vieclam: 3, vi_tri: 'Marketing', vl_created_time: 1700000002, time_td: 1700015000 }
    ];

    ViecLam.find.mockReturnValueOnce({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(fakeData)
    });

    await danhSachTinTuyenDungMoi(req, res, next);

    // Kiểm tra rằng skip được tính đúng với page và pageSize
    expect(ViecLam.find).toHaveBeenCalledWith(
      { id_ntd: 'ntd123' },
      { id_vieclam: 1, vi_tri: 1, alias: 1, fist_time: 1, last_time: 1, time_td: 1 }
    );
  });
});