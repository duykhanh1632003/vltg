const { danhSachNganhNghe } = require('../vieclamtheogio/manageAccountCandidate');
const JobCategory = require('../../models/ViecLamTheoGio/JobCategory');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/JobCategory');
jest.mock('../../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
  findCount: jest.fn(),
}));

describe('Unit Test - danhSachNganhNghe', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  // Test case 1: Lấy danh sách tag (type = 1)
  test('TC01 - Lấy danh sách tag khi type = 1', async () => {
    req.body = { type: 1 };
    const mockData = [{ jc_id: 1, jc_name: 'Tag 1', jc_parent: 10 }, { jc_id: 2, jc_name: 'Tag 2', jc_parent: 11 }];
    const mockTotal = 2;
    functions.findCount.mockResolvedValue(mockTotal);
    JobCategory.find.mockResolvedValue(mockData);

    await danhSachNganhNghe(req, res, next);

    expect(JobCategory.find).toHaveBeenCalledWith({ jc_active: 1, jc_parent: { $gt: 0 } });
    expect(functions.findCount).toHaveBeenCalledWith(JobCategory, { jc_active: 1, jc_parent: { $gt: 0 } });
    expect(functions.success).toHaveBeenCalledWith(res, 'danh sach nganh nghe', { total: mockTotal, data: mockData });
    expect(functions.setError).not.toHaveBeenCalled();
  });

  // Test case 2: Lấy danh sách ngành nghề cha (type khác 1)
  test('TC02 - Lấy danh sách ngành nghề cha khi type khác 1', async () => {
    req.body = { type: 0 };
    const mockData = [{ jc_id: 10, jc_name: 'Ngành 1', jc_parent: 0 }, { jc_id: 11, jc_name: 'Ngành 2', jc_parent: 0 }];
    const mockTotal = 2;
    functions.findCount.mockResolvedValue(mockTotal);
    JobCategory.find.mockResolvedValue(mockData);

    await danhSachNganhNghe(req, res, next);

    expect(JobCategory.find).toHaveBeenCalledWith({ jc_active: 1, jc_parent: 0 });
    expect(functions.findCount).toHaveBeenCalledWith(JobCategory, { jc_active: 1, jc_parent: 0 });
    expect(functions.success).toHaveBeenCalledWith(res, 'danh sach nganh nghe', { total: mockTotal, data: mockData });
    expect(functions.setError).not.toHaveBeenCalled();
  });

  // Test case 3: Lọc theo jc_id
  test('TC03 - Lọc danh sách theo jc_id', async () => {
    req.body = { jc_id: '5' };
    const mockData = [{ jc_id: 5, jc_name: 'Ngành cụ thể', jc_parent: 0 }];
    const mockTotal = 1;
    functions.findCount.mockResolvedValue(mockTotal);
    JobCategory.find.mockResolvedValue(mockData);

    await danhSachNganhNghe(req, res, next);

    expect(JobCategory.find).toHaveBeenCalledWith({ jc_active: 1, jc_parent: 0, jc_id: 5 });
    expect(functions.findCount).toHaveBeenCalledWith(JobCategory, { jc_active: 1, jc_parent: 0, jc_id: 5 });
    expect(functions.success).toHaveBeenCalledWith(res, 'danh sach nganh nghe', { total: mockTotal, data: mockData });
    expect(functions.setError).not.toHaveBeenCalled();
  });

  // Test case 4: Lọc theo jc_parent
  test('TC04 - Lọc danh sách theo jc_parent', async () => {
    req.body = { jc_parent: '10' };
    const mockData = [{ jc_id: 1, jc_name: 'Tag thuộc ngành 10', jc_parent: 10 }];
    const mockTotal = 1;
    functions.findCount.mockResolvedValue(mockTotal);
    JobCategory.find.mockResolvedValue(mockData);

    await danhSachNganhNghe(req, res, next);

    expect(JobCategory.find).toHaveBeenCalledWith({ jc_active: 1, jc_parent: 10 });
    expect(functions.findCount).toHaveBeenCalledWith(JobCategory, { jc_active: 1, jc_parent: 10 });
    expect(functions.success).toHaveBeenCalledWith(res, 'danh sach nganh nghe', { total: mockTotal, data: mockData });
    expect(functions.setError).not.toHaveBeenCalled();
  });

  // Test case 5: Lọc theo cả type và jc_id
  test('TC05 - Lọc danh sách theo type và jc_id', async () => {
    req.body = { type: 1, jc_id: '2' };
    const mockData = [{ jc_id: 2, jc_name: 'Tag cụ thể', jc_parent: 11 }];
    const mockTotal = 1;
    functions.findCount.mockResolvedValue(mockTotal);
    JobCategory.find.mockResolvedValue(mockData);

    await danhSachNganhNghe(req, res, next);

    expect(JobCategory.find).toHaveBeenCalledWith({ jc_active: 1, jc_parent: { $gt: 0 }, jc_id: 2 });
    expect(functions.findCount).toHaveBeenCalledWith(JobCategory, { jc_active: 1, jc_parent: { $gt: 0 }, jc_id: 2 });
    expect(functions.success).toHaveBeenCalledWith(res, 'danh sach nganh nghe', { total: mockTotal, data: mockData });
    expect(functions.setError).not.toHaveBeenCalled();
  });

  // Test case 6: Lọc theo cả type và jc_parent
  test('TC06 - Lọc danh sách theo type và jc_parent', async () => {
    req.body = { type: 1, jc_parent: '10' };
    const mockData = [{ jc_id: 1, jc_name: 'Tag thuộc ngành 10', jc_parent: 10 }];
    const mockTotal = 1;
    functions.findCount.mockResolvedValue(mockTotal);
    JobCategory.find.mockResolvedValue(mockData);

    await danhSachNganhNghe(req, res, next);

    expect(JobCategory.find).toHaveBeenCalledWith({ jc_active: 1, jc_parent: 10 });
    expect(functions.findCount).toHaveBeenCalledWith(JobCategory, { jc_active: 1, jc_parent: 10 });
    expect(functions.success).toHaveBeenCalledWith(res, 'danh sach nganh nghe', { total: mockTotal, data: mockData });
    expect(functions.setError).not.toHaveBeenCalled();
  });

  // Test case 7: Lỗi trong quá trình truy vấn database (JobCategory.find)
  test('TC07 - Lỗi khi truy vấn JobCategory.find', async () => {
    req.body = { type: 1 };
    const errorMessage = 'Database query failed';

    await danhSachNganhNghe(req, res, next);

    expect(JobCategory.find).toHaveBeenCalledWith({ jc_active: 1, jc_parent: { $gt: 0 } });
    expect(functions.setError).toHaveBeenCalledWith(res, errorMessage);
    expect(functions.success).not.toHaveBeenCalled();
  });

  // Test case 8: Lỗi trong quá trình đếm (functions.findCount)
  test('TC08 - Lỗi khi gọi functions.findCount', async () => {
    req.body = { type: 0 };
    const errorMessage = 'Count query failed';

    await danhSachNganhNghe(req, res, next);

    expect(JobCategory.find).toHaveBeenCalledWith({ jc_active: 1, jc_parent: 0 });
    expect(functions.findCount).toHaveBeenCalledWith(JobCategory, { jc_active: 1, jc_parent: 0 });
    expect(functions.setError).toHaveBeenCalledWith(res, errorMessage);
    expect(functions.success).not.toHaveBeenCalled();
  });
});