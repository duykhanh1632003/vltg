const { dangTin } = require('../vieclamtheogio/manageAccountCompany');
const ViecLam = require('../../models/ViecLamTheoGio/ViecLam');
const CaLamViec = require('../../models/ViecLamTheoGio/CaLamViec');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/ViecLam');
jest.mock('../../models/ViecLamTheoGio/CaLamViec');
jest.mock('../../services/functions', () => ({
  convertTimestamp: jest.fn(),
  convertDateToTimestamp: jest.fn(),
  renderAlias: jest.fn(),
  checkDate: jest.fn(),
  checkPhoneNumber: jest.fn(),
  getMaxIdByField: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - dangTin', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 1, type: 1 } },
      body: {
        vi_tri: 'Nhân viên phục vụ',
        dia_diem: 'Hà Nội',
        hinh_thuc: 'Part-time',
        ht_luong: 1,
        tra_luong: 'Theo giờ',
        hoc_van: 'Không yêu cầu',
        so_luong: 5,
        nganh_nghe: 'Dịch vụ',
        cap_bac: 'Nhân viên',
        time_td: '2025-05-01',
        fist_time: '2025-05-02',
        last_time: '2025-05-30',
        mo_ta: 'Phục vụ khách',
        gender: 'Nam',
        yeu_cau: 'Giao tiếp tốt',
        quyen_loi: 'Lương cao',
        ho_so: 'CMND',
        name_lh: 'Nguyễn Văn A',
        phone_lh: '0912345678',
        address_lh: 'Số 1, Hà Nội',
        email_lh: 'test@example.com',
        address: 'Hà Nội',
        list_ca: [{ day: ['2', '4'], ca_start_time: '08:00', ca_end_time: '12:00' }],
        luong: 40000,
      },
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Không phải nhà tuyển dụng (type != 1)', async () => {
    req.user.data.type = 0;

    await dangTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Not company', 403);
  });

  test('TC02 - Thiếu trường vi_tri', async () => {
    delete req.body.vi_tri;

    await dangTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input vi_tri!', 405);
  });

  test('TC03 - Thiếu list_ca', async () => {
    delete req.body.list_ca;

    await dangTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input value list_ca!', 406);
  });

  test('TC04 - Tiêu đề bị trùng', async () => {
    ViecLam.find.mockResolvedValue([]);
    ViecLam.findOne.mockResolvedValue({ vi_tri: 'Nhân viên phục vụ' });

    await dangTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Title bi trung!', 410);
  });

  test('TC05 - Sai định dạng ngày', async () => {
    ViecLam.find.mockResolvedValue([]);
    ViecLam.findOne.mockResolvedValue(null);
    functions.checkDate.mockReturnValue(false);

    await dangTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Invalid date', 406);
  });

  test('TC06 - Sai định dạng số điện thoại', async () => {
    ViecLam.find.mockResolvedValue([]);
    ViecLam.findOne.mockResolvedValue(null);
    functions.checkDate.mockReturnValue(true);
    functions.checkPhoneNumber.mockReturnValue(false);

    await dangTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Invalid phone', 406);
  });

  test('TC07 - Đăng tin thành công', async () => {
    ViecLam.find.mockResolvedValue([]);
    ViecLam.findOne.mockResolvedValue(null);
    functions.checkDate.mockReturnValue(true);
    functions.checkPhoneNumber.mockReturnValue(true);
    functions.renderAlias.mockReturnValue('nhan-vien-phuc-vu');
    functions.convertTimestamp.mockReturnValue(1111111111);
    functions.convertDateToTimestamp.mockReturnValue(1111111112);
    functions.getMaxIdByField.mockResolvedValueOnce(1001); // for ViecLam
    functions.getMaxIdByField.mockResolvedValueOnce(2001); // for CaLamViec
    CaLamViec.prototype.save = jest.fn().mockResolvedValue({});
    ViecLam.prototype.save = jest.fn().mockResolvedValue({});

    await dangTin(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, 'Dang tin thnh cong!');
  });

  test('TC08 - Nếu time_td < thời gian hiện tại', async () => {
    functions.convertDateToTimestamp.mockReturnValue(1111000000);
    functions.convertTimestamp.mockReturnValue(1111111111);
    ViecLam.find.mockResolvedValue([]);
    ViecLam.findOne.mockResolvedValue(null);
    functions.checkDate.mockReturnValue(true);
    functions.checkPhoneNumber.mockReturnValue(true);

    await dangTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'time_td must >= time now', 400);
  });

  test('TC09 - Bị giới hạn đăng tin (đăng liên tục)', async () => {
    ViecLam.find
      .mockResolvedValueOnce([{ id_vieclam: 1 }]) // viecLam1
      .mockResolvedValueOnce(Array(25).fill({})); // viecLam2

    await dangTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(
      res,
      'Mỗi tin của bạn cần đăng cách nhau 10 phút tối đa 24 tin/ngày!',
      411
    );
  });

  test('TC10 - Ném lỗi exception trong try', async () => {
    ViecLam.find.mockRejectedValue(new Error('DB crash'));

    await dangTin(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB crash');
  });
});
