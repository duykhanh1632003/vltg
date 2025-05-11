const { updateAvatarCompany } = require('../controllers/vieclamtheogio/manageAccountCompany'); // cập nhật đúng path
const Users = require('../models/ViecLamTheoGio/Users');
const functions = require('../services/functions');

jest.mock('../models/ViecLamTheoGio/Users');
jest.mock('../services/functions', () => ({
  convertTimestamp: jest.fn(),
  checkFile: jest.fn(),
  uploadFileNameRandom: jest.fn(),
  success: jest.fn(),
  setError: jest.fn(),
}));

describe('updateAvatarCompany - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 123 } },
      files: { avatar: { path: 'path/to/avatar.png', originalFilename: 'avatar.png' } },
    };
    res = {};
    jest.clearAllMocks();
  });

  test('UAC_TC01 - Cập nhật ảnh đại diện thành công', async () => {
    const avatar = req.files.avatar;
    functions.convertTimestamp.mockReturnValue(1111111111);
    functions.checkFile.mockResolvedValue(true);
    functions.uploadFileNameRandom.mockResolvedValue('new-avatar.png');
    Users.findOne.mockResolvedValue({ _id: 123, createdAt: 1111111111 });

    await updateAvatarCompany(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, 'Update avatar company success!');
    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 123, type: 1 },
      { avatarUser: 'new-avatar.png', updatedAt: 1111111111 },
      { new: true }
    );
  });

  test('UAC_TC02 - Thiếu avatar trong request => lỗi thiếu input', async () => {
    req.files = {}; // Không có avatar

    await updateAvatarCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input avatar!', 400);
  });

  test('UAC_TC03 - Kiểm tra định dạng file không hợp lệ => lỗi kích thước hoặc định dạng không hợp lệ', async () => {
    const avatar = req.files.avatar;
    functions.checkFile.mockResolvedValue(false); // File không hợp lệ

    await updateAvatarCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Anh khong dung dinh dang hoac qua lon!', 400);
  });

  test('UAC_TC04 - Không tìm thấy nhà tuyển dụng => lỗi không tồn tại', async () => {
    const avatar = req.files.avatar;
    functions.checkFile.mockResolvedValue(true);
    functions.uploadFileNameRandom.mockResolvedValue('new-avatar.png');
    Users.findOne.mockResolvedValue(null); // Không tìm thấy nhà tuyển dụng

    await updateAvatarCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Nha tuyen dung khong ton tai!', 400);
  });

  test('UAC_TC05 - Xảy ra lỗi trong quá trình xử lý => trả về lỗi', async () => {
    const avatar = req.files.avatar;
    functions.checkFile.mockResolvedValue(true);
    functions.uploadFileNameRandom.mockResolvedValue('new-avatar.png');
    Users.findOne.mockResolvedValue({ _id: 123 });
    Users.findOneAndUpdate.mockRejectedValue(new Error('DB Error')); // Lỗi khi update vào DB

    await updateAvatarCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'DB Error');
  });

  // test('TC06 - Kiểm tra thời gian tạo không có trong đối tượng nhà tuyển dụng', async () => {
  //   const avatar = req.files.avatar;
  //   functions.convertTimestamp.mockReturnValue(1111111111);
  //   functions.checkFile.mockResolvedValue(true);
  //   functions.uploadFileNameRandom.mockResolvedValue('new-avatar.png');
  //   Users.findOne.mockResolvedValue({ _id: 123, createdAt: null }); // createdAt không có

  //   await updateAvatarCompany(req, res);

  //   expect(functions.uploadFileNameRandom).toHaveBeenCalledWith(
  //     'folder_img',
  //     1111111111, // Dùng time thay vì createdAt
  //     avatar
  //   );
  // });

  // test('TC07 - Không có file avatar => trả về lỗi', async () => {
  //   req.files = { avatar: null }; // Không có file avatar trong req.files

  //   await updateAvatarCompany(req, res);

  //   expect(functions.setError).toHaveBeenCalledWith(res, "Missing input avatar!", 400);
  // });

  test('UAC_TC08 - Kiểm tra file kích thước quá lớn', async () => {
    const avatar = req.files.avatar;
    functions.checkFile.mockResolvedValue(false); // File không hợp lệ vì kích thước quá lớn

    await updateAvatarCompany(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Anh khong dung dinh dang hoac qua lon!', 400);
  });

});
