const { nhanViec } = require('../vieclamtheogio/manageAccountCandidate');
const ViecLam = require('../../models/ViecLamTheoGio/ViecLam');
const Users = require('../../models/ViecLamTheoGio/Users');
const UngTuyen = require('../../models/ViecLamTheoGio/UngTuyen');
const ThongBaoNtd = require('../../models/ViecLamTheoGio/ThongBaoNtd');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/ViecLam');
jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../models/ViecLamTheoGio/UngTuyen');
jest.mock('../../models/ViecLamTheoGio/ThongBaoNtd');
jest.mock('../../services/functions', () => ({
  getMaxIdByField: jest.fn(),
  sendEmailNtd: jest.fn(),
  sendEmailApplySuccessToUv: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - nhanViec', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'user123' } },
      body: {},
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Thiếu id_viec hoặc list_ca rỗng', async () => {
    req.body = { list_ca: [] };
    await nhanViec(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input value', 405);
  });

  test('TC02 - Không tìm thấy việc làm', async () => {
    req.body = { id_viec: 101, list_ca: [{ day: ['Thứ 2'], ca_lam: 'Ca sáng', gio_lam: '8h' }] };
    ViecLam.findOne.mockResolvedValue(null);

    await nhanViec(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'Viec lam not found!', 406);
  });

  test('TC03 - Không tìm thấy NTD hoặc Ứng viên', async () => {
    req.body = { id_viec: 101, list_ca: [{ day: ['Thứ 2'], ca_lam: 'Ca sáng', gio_lam: '8h' }] };
    ViecLam.findOne.mockResolvedValue({ id_ntd: 'ntd123' });
    Users.findOne
      .mockResolvedValueOnce(null) // NTD not found
      .mockResolvedValueOnce({});  // UV found

    await nhanViec(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'Nha tuyen dung or Ung vien khong ton tai!', 406);
  });

  test('TC04 - Đã ứng tuyển trước đó', async () => {
    req.body = { id_viec: 101, list_ca: [{ day: ['Thứ 2'], ca_lam: 'Ca sáng', gio_lam: '8h' }] };
    ViecLam.findOne.mockResolvedValue({ id_ntd: 'ntd123' });
    Users.findOne
      .mockResolvedValueOnce({ _id: 'ntd123', type: 1 }) // NTD
      .mockResolvedValueOnce({ _id: 'user123', type: 0 }); // UV
    UngTuyen.findOne.mockResolvedValue({ id_ungtuyen: 1 });

    await nhanViec(req, res);
    expect(functions.setError).toHaveBeenCalledWith(res, 'Ung tuyen da ung tuyen viec lam', 400);
  });

  test('TC05 - Ứng tuyển thành công (đầy đủ flow)', async () => {
    req.body = {
      id_viec: 101,
      list_ca: [{ day: ['Thứ 2', 'Thứ 4'], ca_lam: 'Ca sáng', gio_lam: '8h' }],
    };

    ViecLam.findOne.mockResolvedValue({ id_vieclam: 101, id_ntd: 'ntd123' });
    Users.findOne
      .mockResolvedValueOnce({ _id: 'ntd123', type: 1 }) // NTD
      .mockResolvedValueOnce({ _id: 'user123', userName: 'UV1', avatarUser: 'avatar.jpg', type: 0 }); // UV
    UngTuyen.findOne.mockResolvedValue(null);
    functions.getMaxIdByField.mockResolvedValue(999);
    UngTuyen.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));
    ThongBaoNtd.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));

    await nhanViec(req, res);

    expect(functions.sendEmailNtd).toHaveBeenCalled();
    expect(functions.sendEmailApplySuccessToUv).toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalledWith(res, 'Ung tuyen viec lam thanh cong!');
  });

  test('TC06 - Lỗi bất ngờ trong thao tác DB', async () => {
    req.body = {
      id_viec: 101,
      list_ca: [{ day: ['Thứ 2'], ca_lam: 'Ca sáng', gio_lam: '8h' }],
    };

    ViecLam.findOne.mockRejectedValue(new Error('DB error'));

    await nhanViec(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB error');
  });
});
