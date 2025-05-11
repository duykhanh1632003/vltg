const { updateAvatarCandidate } = require('../vieclamtheogio/manageAccountCandidate');
const Users = require('../../models/ViecLamTheoGio/Users');
const functions = require('../../services/functions');

jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../services/functions', () => ({
  convertTimestamp: jest.fn(),
  checkFile: jest.fn(),
  uploadFileNameRandom: jest.fn(),
  success: jest.fn(),
  setError: jest.fn()
}));

describe('Unit Test - updateAvatarCandidate', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 123 } },
      files: {
        avatar: {
          path: '/fake/path/to/avatar.jpg',
          originalFilename: 'avatar.jpg'
        }
      }
    };
    res = {};
    jest.clearAllMocks();
  });

  test('TC01 - Gửi avatar hợp lệ, ứng viên tồn tại', async () => {
    const mockUser = { _id: 123, createdAt: 1710000000 };
    Users.findOne.mockResolvedValue(mockUser);
    functions.convertTimestamp.mockReturnValue(1711111111);
    functions.checkFile.mockResolvedValue(true);
    functions.uploadFileNameRandom.mockResolvedValue('1710000000-user-avatar.jpg');
    Users.findOneAndUpdate.mockResolvedValue({});

    await updateAvatarCandidate(req, res);

    expect(functions.checkFile).toHaveBeenCalledWith('/fake/path/to/avatar.jpg');
    expect(functions.uploadFileNameRandom).toHaveBeenCalled();
    expect(functions.success).toHaveBeenCalledWith(res, 'Update avatar ung vien success!');
  });

  test('TC02 - Không có trường avatar trong request', async () => {
    delete req.files.avatar;
    Users.findOne.mockResolvedValue({ _id: 123 });
    functions.convertTimestamp.mockReturnValue(1711111111);

    await updateAvatarCandidate(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input avatar!', 400);
  });

  test('TC03 - File không hợp lệ', async () => {
    Users.findOne.mockResolvedValue({ _id: 123 });
    functions.convertTimestamp.mockReturnValue(1711111111);
    functions.checkFile.mockResolvedValue(false);

    await updateAvatarCandidate(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Anh khong dung dinh dang hoac qua lon!', 400);
  });

  test('TC04 - id_uv không tồn tại', async () => {
    Users.findOne.mockResolvedValue(null);
    functions.convertTimestamp.mockReturnValue(1711111111);

    await updateAvatarCandidate(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Ung vien khong ton tai!', 400);
  });

  test('TC05 - createdAt null hoặc undefined', async () => {
    const mockUser = { _id: 123, createdAt: null };
    Users.findOne.mockResolvedValue(mockUser);
    functions.convertTimestamp.mockReturnValue(1711111111);
    functions.checkFile.mockResolvedValue(true);
    functions.uploadFileNameRandom.mockResolvedValue('1711111111-user-avatar.jpg');
    Users.findOneAndUpdate.mockResolvedValue({});

    await updateAvatarCandidate(req, res);

    expect(functions.uploadFileNameRandom).toHaveBeenCalledWith(expect.anything(), 1711111111, expect.anything());
    expect(functions.success).toHaveBeenCalledWith(res, 'Update avatar ung vien success!');
  });

  test('TC06 - Gây lỗi nội bộ trong try-catch', async () => {
    Users.findOne.mockImplementation(() => { throw new Error('Internal Error') });

    await updateAvatarCandidate(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Internal Error');
  });
});
