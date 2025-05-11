const { listCityAndDistrict } = require('../../controllers/vieclamtheogio/manageAccountCandidate');
const City2 = require('../../models/ViecLamTheoGio/City2');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/City2');
jest.mock('../../services/functions');

const mockRes = () => {
  const res = {};
  res.json = jest.fn();
  res.status = jest.fn(() => res);
  return res;
};

describe('Unit Test - listCityAndDistrict', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TC01 - Trả về danh sách tỉnh/thành phố (type != 1)', async () => {
    const req = { body: { type: 0 } };
    const res = mockRes();

    const fakeData = [{ cit_id: 1, cit_name: 'Hà Nội' }];
    const condition = { cit_parent: 0 };

    City2.find.mockReturnValue({
      sort: jest.fn().mockReturnValue(fakeData),
    });
    functions.findCount.mockResolvedValue(1);
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));

    await listCityAndDistrict(req, res);

    expect(City2.find).toHaveBeenCalledWith(condition, {
      cit_id: 1,
      cit_name: 1,
      cit_ndgy: 1,
    });
    expect(functions.findCount).toHaveBeenCalledWith(City2, condition);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Lay ra tag thanh cong',
      data: { total: 1, data: fakeData },
    });
  });

  it('TC02 - Trả về danh sách quận/huyện (type == 1)', async () => {
    const req = { body: { type: 1 } };
    const res = mockRes();

    const fakeData = [{ cit_id: 10, cit_name: 'Quận 1' }];
    const condition = { cit_parent: { $gt: 0 } };

    City2.find.mockReturnValue({
      sort: jest.fn().mockReturnValue(fakeData),
    });
    functions.findCount.mockResolvedValue(1);
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));

    await listCityAndDistrict(req, res);

    expect(City2.find).toHaveBeenCalledWith(condition, expect.any(Object));
    expect(functions.findCount).toHaveBeenCalledWith(City2, condition);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Lay ra tag thanh cong',
      data: { total: 1, data: fakeData },
    });
  });

  it('TC03 - Lọc theo cit_id và cit_parent', async () => {
    const req = { body: { cit_id: 2, cit_parent: 1 } };
    const res = mockRes();

    const condition = { cit_id: 2, cit_parent: 1 };
    const fakeData = [{ cit_id: 2, cit_name: 'Hải Phòng' }];

    City2.find.mockReturnValue({
      sort: jest.fn().mockReturnValue(fakeData),
    });
    functions.findCount.mockResolvedValue(1);
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));

    await listCityAndDistrict(req, res);

    expect(City2.find).toHaveBeenCalledWith(condition, expect.any(Object));
    expect(functions.findCount).toHaveBeenCalledWith(City2, condition);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Lay ra tag thanh cong',
      data: { total: 1, data: fakeData },
    });
  });

  it('TC04 - Trường hợp xảy ra lỗi', async () => {
    const req = { body: { type: 0 } };
    const res = mockRes();

    const errorMsg = 'DB failed';
    City2.find.mockImplementation(() => {
      throw new Error(errorMsg);
    });
    functions.setError.mockImplementation((res, msg) => res.json({ error: msg }));

    await listCityAndDistrict(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, errorMsg);
  });
});
