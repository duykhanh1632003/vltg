// tests/controllers/trangChu.test.js
const { trangChu } = require('../vieclamtheogio/viecLam');
const ViecLam = require('../../models/ViecLamTheoGio/ViecLam');
const Users = require('../../models/ViecLamTheoGio/Users');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/ViecLam');
jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../services/functions');

const mockRes = () => {
  const res = {};
  res.json = jest.fn();
  res.status = jest.fn(() => res);
  return res;
};

describe('Unit Test - trangChu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TC01 - Trả về danh sách trang chủ với user có city Hà Nội', async () => {
    const req = {
      body: { page: 1, pageSize: 24 },
      user: { data: { _id: 'user123' } },
    };
    const res = mockRes();

    Users.findOne.mockResolvedValue({ city: 'Hà Nội' });
    ViecLam.aggregate.mockResolvedValueOnce([{ vi_tri: 'Dev', ntd_createdAt: '2024-01-01', ntd_avatar: 'avt.png' }]);
    ViecLam.aggregate.mockResolvedValueOnce([{ vi_tri: 'Tester', ntd_createdAt: '2024-01-01', ntd_avatar: 'avt2.png' }]);
    functions.findCount.mockResolvedValueOnce(10);
    functions.findCount.mockResolvedValueOnce(8);
    functions.getLinkFile.mockReturnValue('http://domain.com/avatar.png');
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));

    await trangChu(req, res);

    expect(Users.findOne).toHaveBeenCalledWith({ _id: 'user123' });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: expect.any(String),
      data: expect.any(Object),
    }));
  });

  it('TC02 - Phân trang với page 2, pageSize 10', async () => {
    const req = { body: { page: 2, pageSize: 10 }, user: null };
    const res = mockRes();

    ViecLam.aggregate.mockResolvedValueOnce([]);
    ViecLam.aggregate.mockResolvedValueOnce([]);
    functions.findCount.mockResolvedValueOnce(0);
    functions.findCount.mockResolvedValueOnce(0);
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));

    await trangChu(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: expect.any(String),
      data: expect.any(Object),
    }));
  });

  it('TC03 - Không có page, pageSize', async () => {
    const req = { body: {}, user: null };
    const res = mockRes();

    ViecLam.aggregate.mockResolvedValueOnce([]);
    ViecLam.aggregate.mockResolvedValueOnce([]);
    functions.findCount.mockResolvedValueOnce(0);
    functions.findCount.mockResolvedValueOnce(0);
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));

    await trangChu(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it('TC04 - Không có user', async () => {
    const req = { body: { page: 1, pageSize: 10 } };
    const res = mockRes();

    ViecLam.aggregate.mockResolvedValueOnce([]);
    ViecLam.aggregate.mockResolvedValueOnce([]);
    functions.findCount.mockResolvedValueOnce(0);
    functions.findCount.mockResolvedValueOnce(0);
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));

    await trangChu(req, res);

    expect(Users.findOne).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('TC05 - User có city là TPHCM', async () => {
    const req = {
      body: { page: 1, pageSize: 10 },
      user: { data: { _id: 'user456' } },
    };
    const res = mockRes();

    Users.findOne.mockResolvedValue({ city: 'TPHCM' });
    ViecLam.aggregate.mockResolvedValueOnce([]);
    ViecLam.aggregate.mockResolvedValueOnce([]);
    functions.findCount.mockResolvedValueOnce(0);
    functions.findCount.mockResolvedValueOnce(0);
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));

    await trangChu(req, res);

    expect(Users.findOne).toHaveBeenCalledWith({ _id: 'user456' });
    expect(res.json).toHaveBeenCalled();
  });

  it('TC06 - Xử lý lỗi từ Users.findOne', async () => {
    const req = {
      body: { page: 1, pageSize: 10 },
      user: { data: { _id: 'userFail' } },
    };
    const res = mockRes();

    Users.findOne.mockRejectedValue(new Error('Lỗi tìm user'));
    functions.setError.mockImplementation((res, msg) => res.json({ error: msg }));

    await trangChu(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Lỗi tìm user');
  });

  it('TC06b - Xử lý lỗi từ ViecLam.aggregate', async () => {
    const req = { body: { page: 1, pageSize: 10 }, user: null };
    const res = mockRes();

    ViecLam.aggregate.mockRejectedValue(new Error('Aggregate lỗi'));
    functions.setError.mockImplementation((res, msg) => res.json({ error: msg }));

    await trangChu(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Aggregate lỗi');
  });

  it('TC07 - Tạo linkAvatar từ ntd_createdAt & ntd_avatar', async () => {
    const req = {
      body: { page: 1, pageSize: 5 },
      user: { data: { _id: 'user789' } },
    };
    const res = mockRes();

    Users.findOne.mockResolvedValue({ city: 'Đà Nẵng' });
    ViecLam.aggregate.mockResolvedValueOnce([{ ntd_createdAt: '2024-01-01', ntd_avatar: 'abc.png' }]);
    ViecLam.aggregate.mockResolvedValueOnce([{ ntd_createdAt: '2024-01-02', ntd_avatar: 'xyz.png' }]);
    functions.findCount.mockResolvedValueOnce(1);
    functions.findCount.mockResolvedValueOnce(1);
    functions.getLinkFile.mockReturnValue('http://domain.com/avatar.png');
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));

    await trangChu(req, res);

    expect(functions.getLinkFile).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('TC08 - Thành phố không tồn tại', async () => {
    const req = {
      body: {},
      user: { data: { _id: 'user999' } },
    };
    const res = mockRes();

    Users.findOne.mockResolvedValue({ city: 'Thành Phố Không Tồn Tại' });
    ViecLam.aggregate.mockResolvedValueOnce([]);
    ViecLam.aggregate.mockResolvedValueOnce([]);
    functions.findCount.mockResolvedValueOnce(0);
    functions.findCount.mockResolvedValueOnce(0);
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));

    await trangChu(req, res);

    expect(res.json).toHaveBeenCalled();
  });
});