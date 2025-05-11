const functions = require('../services/functions');
const ViecLam = require('../models/ViecLamTheoGio/ViecLam');
const CaLamViec = require('../models/ViecLamTheoGio/CaLamViec');
const { suaTin } = require('../controllers/vieclamtheogio/manageAccountCompany');

jest.mock('../models/ViecLamTheoGio/ViecLam');
jest.mock('../models/vieclamtheogio/CaLamViec');
jest.mock('../services/functions');

describe('suaTin', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'ntd123', type: 1 } }, // giả lập người dùng có type = 1
      body: {
        id_vieclam: 1,
        vi_tri: 'IT Developer',
        nganh_nghe: 1,
        dia_diem: 'Hanoi',
        quan_huyen: 'Hoan Kiem',
        cap_bac: 'Senior',
        hinh_thuc: 'Full-time',
        ht_luong: 1,
        tra_luong: 'monthly',
        luong: 5000,
        luong_first: 4000,
        luong_last: 6000,
        thoi_gian: '1 year',
        hoa_hong: 10,
        so_luong: 2,
        hoc_van: 'Bachelor',
        time_td: 1609459200,
        fist_time: 1609459200,
        last_time: 1609545600,
        alias: 'it-developer-hanoi',
        mo_ta: 'Develop software',
        gender: 'Male',
        yeu_cau: 'Experience in NodeJS',
        quyen_loi: 'Health insurance',
        ho_so: 'CV',
        name_lh: 'John Doe',
        phone_lh: '0987654321',
        address_lh: 'Hanoi',
        email_lh: 'john.doe@example.com',
        list_ca: [
          { day: [1, 2], ca_start_time: '09:00', ca_end_time: '18:00' },
          { day: [3, 4], ca_start_time: '09:00', ca_end_time: '18:00' }
        ]
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    functions.convertTimestamp.mockReturnValue(1609459200);
    functions.checkDate.mockReturnValue(true);  // giả lập ngày hợp lệ
    functions.checkPhoneNumber.mockReturnValue(true);  // giả lập số điện thoại hợp lệ
    functions.renderAlias.mockReturnValue('it-developer-hanoi');
    functions.getMaxIdByField.mockResolvedValue(1);
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));
    functions.setError.mockImplementation((res, msg) => res.status(500).json({ message: msg }));
  });

  it('ST_TC01 - Trả về lỗi nếu người dùng có type không phải 1', async () => {
    req.user.data.type = 0;  // Giả lập người dùng có type khác 1

    await suaTin(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, "Not company", 403);
  });

  it('ST_TC02 - Trả về lỗi nếu thiếu id_vieclam', async () => {
    req.body.id_vieclam = undefined;

    await suaTin(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input id_vieclam!", 400);
  });

  it('ST_TC03 - Trả về lỗi nếu thiếu trường thông tin quan trọng', async () => {
    req.body.vi_tri = undefined;

    await suaTin(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value 1", 405);
  });

  it('ST_TC04 - Trả về lỗi nếu ngày không hợp lệ', async () => {
    functions.checkDate.mockReturnValueOnce(false); // giả lập ngày không hợp lệ

    await suaTin(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, "Invalid date", 406);
  });

  it('ST_TC05 - Trả về lỗi nếu số điện thoại không hợp lệ', async () => {
    functions.checkPhoneNumber.mockReturnValueOnce(false);  // giả lập số điện thoại không hợp lệ

    await suaTin(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, "Invalid phone", 406);
  });

  it('ST_TC06 - Trả về lỗi nếu thiếu thông tin list_ca', async () => {
    req.body.list_ca = undefined;

    await suaTin(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, "Missing input value list_ca!", 400);
  });

  it('ST_TC07 - Update thành công và trả về thông báo', async () => {
    const fakeViecLam = { id_vieclam: 1, vi_tri: 'IT Developer' };  // Giả lập kết quả tìm thấy công việc
    ViecLam.findOneAndUpdate.mockResolvedValue(fakeViecLam);

    await suaTin(req, res, next);

    expect(functions.success).toHaveBeenCalledWith(res, "Sua tin thnh cong!");
  });

  it('ST_TC08 - Trả về lỗi nếu không tìm thấy viecLam', async () => {
    ViecLam.findOneAndUpdate.mockResolvedValue(null);  // Giả lập không tìm thấy công việc

    await suaTin(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, "Viec lam not found!", 404);
  });

  it('ST_TC09 - Trả về lỗi nếu có lỗi khi truy vấn cơ sở dữ liệu', async () => {
    req.user.data.type = 1;
    ViecLam.findOneAndUpdate.mockRejectedValue(new Error('Database error'));  // Giả lập lỗi cơ sở dữ liệu

    await suaTin(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, "Database error");
  });

  it('ST_TC10 - Kiểm tra việc tính toán và lưu các ca làm việc', async () => {
    const fakeViecLam = { id_vieclam: 1, vi_tri: 'IT Developer' };
    ViecLam.findOneAndUpdate.mockResolvedValue(fakeViecLam);

    await suaTin(req, res, next);

    expect(CaLamViec.deleteMany).toHaveBeenCalledWith({ ca_id_viec: 1 });
    expect(CaLamViec.prototype.save).toHaveBeenCalled();
  });
});
