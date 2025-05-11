const { getInfoCompany } = require('../controllers/vieclamtheogio/manageAccountCompany');
const Users = require('../models/ViecLamTheoGio/Users');
const functions = require('../services/functions');

jest.mock('../models/ViecLamTheoGio/Users');
jest.mock('../services/functions', () => ({
  convertTimestamp: jest.fn(),
  getLinkFile: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - getInfoCompany', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { data: { _id: 1, type: 1 } }, // Giả lập là nhà tuyển dụng
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() }; // Mock res object
    next = jest.fn();
    jest.clearAllMocks();
  });

  // test('TC01 - Người dùng không phải nhà tuyển dụng (type != 1)', async () => {
  //   req.user.data.type = 0; // Thay đổi type thành 0 (không phải nhà tuyển dụng)

  //   await getInfoCompany(req, res, next);

  //   expect(functions.setError).toHaveBeenCalledWith(res, 'Nha tuyen dung not found!', 404);
  // });

  test('GIC_TC02 - Người dùng không tồn tại trong cơ sở dữ liệu', async () => {
    Users.findOne.mockResolvedValue(null); // Mô phỏng không tìm thấy người dùng trong DB

    await getInfoCompany(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Nha tuyen dung not found!', 404);
  });

  test('GIC_TC03 - Người dùng không có trường createdAt', async () => {
    const mockUser = { _id: 1, type: 1, avatarUser: 'avatar.jpg' };
    Users.findOne.mockResolvedValue(mockUser); // Người dùng không có trường createdAt

    functions.convertTimestamp.mockReturnValue(1111111111); // Giả lập convertTimestamp

    await getInfoCompany(req, res, next);

    expect(functions.getLinkFile).toHaveBeenCalledWith(expect.anything(), 1111111111, 'avatar.jpg');
    expect(functions.success).toHaveBeenCalledWith(res, 'lay ra thong tin thanh cong!', expect.anything());
  });

  test('GIC_TC04 - Người dùng tồn tại và có đầy đủ thông tin', async () => {
    const mockUser = {
      _id: 1,
      type: 1,
      avatarUser: 'avatar.jpg',
      createdAt: 1622520000, // Có createdAt
      userName: 'Company A',
      email: 'contact@companya.com',
    };
    Users.findOne.mockResolvedValue(mockUser);

    functions.convertTimestamp.mockReturnValue(1622520000); // Mô phỏng chuyển đổi timestamp
    functions.getLinkFile.mockReturnValue('http://example.com/avatar.jpg'); // Mô phỏng link file

    await getInfoCompany(req, res, next);

    expect(functions.success).toHaveBeenCalledWith(res, 'lay ra thong tin thanh cong!', {
      data: mockUser,
    });
    expect(functions.getLinkFile).toHaveBeenCalledWith(expect.anything(), 1622520000, 'avatar.jpg');
  });

  test('GIC_TC05 - Lỗi trong quá trình truy vấn dữ liệu (khi gọi findOne)', async () => {
    // Users.findOne.mockRejectedValue(new Error('Database error')); // Mô phỏng lỗi khi truy vấn

    // await getInfoCompany(req, res, next);

    // expect(functions.setError).toHaveBeenCalledWith(res, 'Database error');
    const errorMessage = "Database error";
    Users.findOne.mockRejectedValue(new Error(errorMessage)); // Giả lập lỗi khi gọi `findOne`
    
    await getInfoCompany(req, res);
    
    // Kiểm tra xem hàm setError có được gọi với thông báo lỗi không
    expect(functions.setError).toHaveBeenCalledWith(res, errorMessage);
  });

  test('GIC_TC06 - Người dùng có trường createdAt nhưng lỗi trong convertTimestamp', async () => {
    const mockUser = {
      _id: 1,
      type: 1,
      avatarUser: 'avatar.jpg',
      createdAt: 1622520000,
    };
    Users.findOne.mockResolvedValue(mockUser);

    functions.convertTimestamp.mockImplementation(() => { throw new Error('Timestamp error') }); // Mô phỏng lỗi khi convert timestamp

    await getInfoCompany(req, res, next);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Timestamp error');
  });

  test('GIC_TC07 - Người dùng không có avatarUser', async () => {
    const mockUser = {
      _id: 1,
      type: 1,
      createdAt: 1622520000,
      userName: 'Company A',
      email: 'contact@companya.com',
    };
    Users.findOne.mockResolvedValue(mockUser);

    functions.convertTimestamp.mockReturnValue(1622520000);

    await getInfoCompany(req, res, next);

    expect(functions.success).toHaveBeenCalledWith(res, 'lay ra thong tin thanh cong!', {
      data: mockUser,
    });
  });
});
