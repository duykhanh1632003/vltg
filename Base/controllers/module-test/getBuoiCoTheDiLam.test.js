const { getBuoiCoTheDiLam } = require('../vieclamtheogio/manageAccountCandidate');
const Users = require('../../models/ViecLamTheoGio/Users');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('Unit Test - getBuoiCoTheDiLam', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 'user123' } },
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Tìm thấy user', async () => {
    const mockUser = {
      userName: 'John Doe',
      phone: '0909090909',
      phoneTK: '0909090909',
      email: 'john@example.com',
      city: 'HCM',
      district: '1',
      address: '123 Street',
      gender: 1,
      married: 0,
      birthday: '1990-01-01',
      uv_day: '2024-01-01',
      luot_xem: 5,
    };

    Users.findOne.mockResolvedValue(mockUser);

    await getBuoiCoTheDiLam(req, res);

    expect(Users.findOne).toHaveBeenCalledWith(
      { _id: 'user123', type: 0 },
      {
        userName: "$userName",
        phone: "$phone",
        phoneTK: "$phoneTK",
        email: "$email",
        city: "$city",
        district: "$district",
        address: "$address",
        gender: "$gender",
        married: "$married",
        birthday: "$birthday",
        uv_day: "$uv_day",
        luot_xem: "$luot_xem",
      }
    );

    expect(functions.success).toHaveBeenCalledWith(res, 'get info ung vien thanh cong', {
      data: mockUser,
    });
  });

  test('TC02 - Không tìm thấy user (null)', async () => {
    Users.findOne.mockResolvedValue(null);

    await getBuoiCoTheDiLam(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'ung vien not fund!', 404);
  });

  test('TC03 - Gặp lỗi bất ngờ khi truy vấn DB', async () => {
    const error = new Error('Database error');
    Users.findOne.mockImplementation(() => {
      throw error;
    });

    await getBuoiCoTheDiLam(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Database error');
  });
});
