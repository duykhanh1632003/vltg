const { ungVienMoiUngTuyen } = require('../controllers/vieclamtheogio/manageAccountCompany');
const ViecLam = require('../models/ViecLamTheoGio/ViecLam');
const UngTuyen = require('../models/ViecLamTheoGio/UngTuyen');
const functions = require('../services/functions');

jest.mock('../models/ViecLamTheoGio/ViecLam');
jest.mock('../models/ViecLamTheoGio/UngTuyen');
jest.mock('../services/functions', () => ({
  success: jest.fn(),
  setError: jest.fn()
}));

// gpt thường
describe('Unit Test - ungVienMoiUngTuyen', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { data: { _id: 1, type: 1 } },
      body: { page: 1, pageSize: 6 }
    };
    res = {};
    jest.clearAllMocks();
  });

  test('UVMUT_TC01 - Trả về danh sách ứng viên thành công', async () => {
    ViecLam.aggregate.mockResolvedValue([{ uv_id: 1, UngTuyen: [{}] }]);
    UngTuyen.distinct.mockResolvedValue([1, 2]);

    await ungVienMoiUngTuyen(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'danh sach ung vien moi ung tuyen',
      { total: 2, data: [{ uv_id: 1, UngTuyen: [{}] }] }
    );
  });

  test('UVMUT_TC02 - Thiếu page và pageSize, dùng mặc định', async () => {
    req.body = {};
    ViecLam.aggregate.mockResolvedValue([]);
    UngTuyen.distinct.mockResolvedValue([]);

    await ungVienMoiUngTuyen(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'danh sach ung vien moi ung tuyen',
      { total: 0, data: [] }
    );
  });

  test('UVMUT_TC03 - Truyền thêm status để lọc', async () => {
    req.body.status = 1;
    ViecLam.aggregate.mockResolvedValue([]);
    UngTuyen.distinct.mockResolvedValue([]);

    await ungVienMoiUngTuyen(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'danh sach ung vien moi ung tuyen',
      { total: 0, data: [] }
    );
  });

  test('UVMUT_TC04 - Có lỗi xảy ra trong quá trình truy vấn', async () => {
    ViecLam.aggregate.mockRejectedValue(new Error('Mongo crashed'));

    await ungVienMoiUngTuyen(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Mongo crashed');
  });

  // test('TC05 - Trường hợp không có user hợp lệ', async () => {
  //   req.user = null;

  //   await ungVienMoiUngTuyen(req, res);

  //   expect(functions.setError).toHaveBeenCalled();
  // });

  // test('TC06 - Người dùng không phải nhà tuyển dụng', async () => {
  //   req.user.data.type = 0;

  //   await ungVienMoiUngTuyen(req, res);

  //   expect(functions.setError).toHaveBeenCalled();
  // });

  test('UVMUT_TC07 - page hoặc pageSize truyền vào không hợp lệ (string)', async () => {
    req.body.page = 'abc';
    req.body.pageSize = 'xyz';
    ViecLam.aggregate.mockResolvedValue([]);
    UngTuyen.distinct.mockResolvedValue([]);

    await ungVienMoiUngTuyen(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'danh sach ung vien moi ung tuyen',
      { total: 0, data: [] }
    );
  });
});



// gpt xịn
// describe('ungVienMoiUngTuyen', () => {
//     let req, res, next;
  
//     beforeEach(() => {
//       req = {
//         user: { data: { _id: 'ntd123', type: 1 } },
//         body: {
//           page: 1,
//           pageSize: 6,
//           status: 1,
//         }
//       };
//       res = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn()
//       };
//       next = jest.fn();
  
//       functions.success.mockImplementation((res, msg, data) => res.json({ msg, data }));
//       functions.setError.mockImplementation((res, msg) => res.status(500).json({ message: msg }));
//     });
  
//     it('TC01 - Trả về lỗi nếu thiếu `page` trong `req.body`', async () => {
//       req.body.page = undefined;  // Thiếu tham số page
  
//       await ungVienMoiUngTuyen(req, res, next);
  
//       expect(functions.setError).toHaveBeenCalledWith(res, "Missing input page", 405);
//     });
  
//     it('TC02 - Trả về lỗi nếu thiếu `pageSize` trong `req.body`', async () => {
//       req.body.pageSize = undefined;  // Thiếu tham số pageSize
  
//       await ungVienMoiUngTuyen(req, res, next);
  
//       expect(functions.setError).toHaveBeenCalledWith(res, "Missing input pageSize", 405);
//     });
  
//     it('TC03 - Trả về lỗi nếu thiếu `status` trong `req.body`', async () => {
//       req.body.status = undefined;  // Thiếu tham số status
  
//       await ungVienMoiUngTuyen(req, res, next);
  
//       expect(functions.setError).toHaveBeenCalledWith(res, "Missing input status", 405);
//     });
  
//     it('TC04 - Trả về lỗi nếu không tìm thấy công việc', async () => {
//       // Giả lập không có công việc trong cơ sở dữ liệu
//       ViecLam.aggregate.mockResolvedValue([]);
  
//       await ungVienMoiUngTuyen(req, res, next);
  
//       expect(functions.setError).toHaveBeenCalledWith(res, "No job found", 404);
//     });
  
//     it('TC05 - Trả về lỗi nếu không có ứng viên', async () => {
//       // Giả lập công việc tồn tại nhưng không có ứng viên
//       const fakeData = [{ id_vieclam: 1, vi_tri: 'IT Developer' }];
//       ViecLam.aggregate.mockResolvedValue(fakeData);
//       UngTuyen.distinct.mockResolvedValue([]);
  
//       await ungVienMoiUngTuyen(req, res, next);
  
//       expect(functions.setError).toHaveBeenCalledWith(res, "No applicants found", 404);
//     });
  
//     it('TC06 - Trả về dữ liệu hợp lệ khi có công việc và ứng viên', async () => {
//       // Giả lập công việc và ứng viên tồn tại
//       const fakeData = [
//         {
//           id_vieclam: 1,
//           vi_tri: 'IT Developer',
//           UngTuyen: [{ id_uv: 1, status: 1 }],
//           UngVien: [{ userName: 'JohnDoe', phone: '0987654321', city: 'Hanoi', address: 'Hanoi, Vietnam' }]
//         }
//       ];
  
//       ViecLam.aggregate.mockResolvedValue(fakeData);
//       UngTuyen.distinct.mockResolvedValue([1]);
  
//       await ungVienMoiUngTuyen(req, res, next);
  
//       expect(functions.success).toHaveBeenCalledWith(res, "danh sach ung vien moi ung tuyen", {
//         total: 1,
//         data: fakeData,
//       });
//     });
  
//     it('TC07 - Trả về lỗi khi xảy ra lỗi trong quá trình truy vấn', async () => {
//       // Giả lập lỗi trong quá trình truy vấn
//       ViecLam.aggregate.mockRejectedValue(new Error('Database error'));
  
//       await ungVienMoiUngTuyen(req, res, next);
  
//       expect(functions.setError).toHaveBeenCalledWith(res, "Database error", 500);
//     });
  
//     it('TC08 - Kiểm tra việc phân trang khi có dữ liệu', async () => {
//       const fakeData = [
//         { id_vieclam: 1, vi_tri: 'IT Developer', UngTuyen: [{ id_uv: 1, status: 1 }] },
//         { id_vieclam: 2, vi_tri: 'Designer', UngTuyen: [{ id_uv: 2, status: 1 }] }
//       ];
  
//       ViecLam.aggregate.mockResolvedValue(fakeData);
//       UngTuyen.distinct.mockResolvedValue([1, 2]);
  
//       await ungVienMoiUngTuyen(req, res, next);
  
//       // Kiểm tra phân trang
//       expect(ViecLam.aggregate).toHaveBeenCalledWith(expect.arrayContaining([{
//         $skip: 0,
//         $limit: 6,
//       }]));
//     });
  
//     it('TC09 - Kiểm tra khi có `status` trong `req.body`', async () => {
//       req.body.status = 1;  // Giả lập có status trong request
  
//       const fakeData = [
//         { id_vieclam: 1, vi_tri: 'IT Developer', UngTuyen: [{ id_uv: 1, status: 1 }] }
//       ];
  
//       ViecLam.aggregate.mockResolvedValue(fakeData);
//       UngTuyen.distinct.mockResolvedValue([1]);
  
//       await ungVienMoiUngTuyen(req, res, next);
  
//       // Kiểm tra nếu status được sử dụng trong truy vấn
//       expect(functions.success).toHaveBeenCalledWith(res, "danh sach ung vien moi ung tuyen", {
//         total: 1,
//         data: fakeData,
//       });
//     });
//   });