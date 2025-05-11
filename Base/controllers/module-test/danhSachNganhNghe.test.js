const { danhSachNganhNghe } = require('../../controllers/vieclamtheogio/manageAccountCandidate');
const JobCategory = require('../../models/ViecLamTheoGio/JobCategory');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/JobCategory');
jest.mock('../../services/functions');

const mockRes = () => {
  const res = {};
  res.json = jest.fn();
  res.status = jest.fn(() => res);
  return res;
};

describe('Unit Test - danhSachNganhNghe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TC01 - Trả về danh sách ngành nghề chính (jc_parent = 0)', async () => {
    const req = { body: { type: 0 } };
    const res = mockRes();

    const fakeData = [{ jc_id: 1, jc_name: 'CNTT' }];
    functions.findCount.mockResolvedValue(1);
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnValue(fakeData),
    });
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));

    await danhSachNganhNghe(req, res);

    expect(functions.findCount).toHaveBeenCalledWith(JobCategory, { jc_active: 1, jc_parent: 0 });
    expect(JobCategory.find).toHaveBeenCalledWith({ jc_active: 1, jc_parent: 0 });
    expect(functions.success).toHaveBeenCalledWith(res, 'danh sach nganh nghe', {
      total: 1,
      data: fakeData,
    });
  });

  it('TC02 - Trả về danh sách tag ngành nghề (type = 1, jc_parent > 0)', async () => {
    const req = { body: { type: 1 } };
    const res = mockRes();
  
    const condition = { jc_active: 1, jc_parent: { $gt: 0 } };
    const fakeData = [{ jc_id: 10, jc_name: 'Back-end' }];
    functions.findCount.mockResolvedValue(1);
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnValue(fakeData),
    });
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));
  
    await danhSachNganhNghe(req, res);
  
    expect(functions.findCount).toHaveBeenCalledWith(JobCategory, condition);
    expect(JobCategory.find).toHaveBeenCalledWith(condition);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        data: fakeData,
        total: 1
      })
    }));
  });
  

  it('TC03 - Truy vấn theo jc_id', async () => {
    const req = { body: { jc_id: 5 } };
    const res = mockRes();

    const condition = { jc_active: 1, jc_parent: 0, jc_id: 5 };
    const fakeData = [{ jc_id: 5, jc_name: 'Thiết kế' }];
    functions.findCount.mockResolvedValue(1);
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnValue(fakeData),
    });
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));

    await danhSachNganhNghe(req, res);

    expect(functions.findCount).toHaveBeenCalledWith(JobCategory, condition);
    expect(JobCategory.find).toHaveBeenCalledWith(condition);
    expect(res.json).toHaveBeenCalled();
  });

  it('TC04 - Truy vấn theo jc_parent', async () => {
    const req = { body: { jc_parent: 3 } };
    const res = mockRes();
  
    const condition = { jc_active: 1, jc_parent: 3 };
    const fakeData = [{ jc_id: 7, jc_name: 'Thiết kế UI/UX' }];
    functions.findCount.mockResolvedValue(1);
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnValue(fakeData),
    });
    functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));
  
    await danhSachNganhNghe(req, res);
  
    expect(JobCategory.find).toHaveBeenCalledWith(condition);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        data: fakeData,
        total: 1
      })
    }));
  });
  
  it('TC05 - Xử lý khi xảy ra lỗi', async () => {
    const req = { body: { type: 0 } };
    const res = mockRes();

    const errorMsg = 'DB error';
    functions.findCount.mockRejectedValue(new Error(errorMsg));
    functions.setError.mockImplementation((res, msg) => res.json({ error: msg }));

    await danhSachNganhNghe(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, errorMsg);
  });
});
