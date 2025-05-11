const functions = require('../services/functions');
const ViecLam = require('../models/ViecLamTheoGio/ViecLam');
const { lamMoiTin } = require('../controllers/vieclamtheogio/manageAccountCompany');

jest.mock('../models/ViecLamTheoGio/ViecLam');
jest.mock('../services/functions');

describe('lamMoiTin', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'ntd123', type: 1 } },
      body: {
        id_vieclam: 1,
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    functions.convertTimestamp.mockReturnValue(1617235200);  // Mock timestamp
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));
    functions.setError.mockImplementation((res, msg) => res.status(500).json({ message: msg }));
  });

  it('LMT_TC01 - Trả về lỗi nếu thiếu id_vieclam', async () => {
    req.body.id_vieclam = undefined;  // Thiếu id_vieclam trong request body

    await lamMoiTin(req, res, next);

    // Kiểm tra lỗi "Missing input id_vieclam"
    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input id_vieclam", 405);
  });

  it('LMT_TC02 - Trả về lỗi nếu không tìm thấy công việc', async () => {
    req.body.id_vieclam = 999;  // ID công việc không tồn tại

    // Giả lập không tìm thấy công việc
    ViecLam.findOneAndUpdate.mockResolvedValue(null);

    await lamMoiTin(req, res, next);

    // Kiểm tra lỗi "Viec lam not found!"
    expect(functions.setError).toHaveBeenCalledWith(res, "Viec lam not found!", 404);
  });

  it('LMT_TC03 - Trả về lỗi nếu id_vieclam không hợp lệ', async () => {
    req.body.id_vieclam = 'abc';  // id_vieclam là chuỗi thay vì số

    await lamMoiTin(req, res, next);

    // Kiểm tra lỗi "Missing input id_vieclam"
    expect(functions.setError).toHaveBeenCalledWith(res, "Viec lam not found!", 404);
  });

  it('LMT_TC04 - Update công việc thành công', async () => {
    req.body.id_vieclam = 1;  // ID công việc hợp lệ

    // Giả lập công việc được tìm thấy và cập nhật thành công
    const fakeViecLam = { id_vieclam: 1, vi_tri: 'IT Developer' };
    ViecLam.findOneAndUpdate.mockResolvedValue(fakeViecLam);

    await lamMoiTin(req, res, next);

    // Kiểm tra kết quả thành công "Lam moi tin thanh cong"
    expect(functions.success).toHaveBeenCalledWith(res, "Lam moi tin thanh cong");
  });

  it('LMT_TC05 - Trả về lỗi khi xảy ra lỗi cơ sở dữ liệu', async () => {
    req.body.id_vieclam = 1;  // ID công việc hợp lệ

    // Giả lập lỗi cơ sở dữ liệu
    ViecLam.findOneAndUpdate.mockRejectedValue(new Error('Database error'));

    await lamMoiTin(req, res, next);

    // Kiểm tra thông báo lỗi
    expect(functions.setError).toHaveBeenCalledWith(res, "Database error");
  });

  it('LMT_TC06 - Trả về lỗi khi không thể chuyển đổi timestamp', async () => {
    // Giả lập lỗi trong việc chuyển đổi timestamp
    functions.convertTimestamp.mockImplementationOnce(() => { throw new Error('Timestamp error'); });

    await lamMoiTin(req, res, next);

    // Kiểm tra lỗi trong việc chuyển đổi timestamp
    expect(functions.setError).toHaveBeenCalledWith(res, "Timestamp error");
  });

  it('LMT_TC07 - Kiểm tra khi công việc đã được cập nhật với thời gian mới', async () => {
    req.body.id_vieclam = 1;  // ID công việc hợp lệ

    // Giả lập công việc được cập nhật
    const fakeViecLam = { id_vieclam: 1, vi_tri: 'IT Developer', created_at: 1617235200 };
    ViecLam.findOneAndUpdate.mockResolvedValue(fakeViecLam);

    await lamMoiTin(req, res, next);

    // Kiểm tra xem thời gian tạo đã được cập nhật thành công
    expect(ViecLam.findOneAndUpdate).toHaveBeenCalledWith(
      { id_vieclam: 1 },
      { created_at: 1617235200 },
      { new: true }
    );
  });
});
