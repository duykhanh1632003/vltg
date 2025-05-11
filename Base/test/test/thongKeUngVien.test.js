const { thongKeUngVien } = require("../controllers/vieclamtheogio/manageAccountCompany");
const Users = require("../models/ViecLamTheoGio/Users");
const JobCategory = require("../models/ViecLamTheoGio/JobCategory");
const City = require("../models/ViecLamTheoGio/City");
const functions = require("../services/functions");

jest.mock("../models/ViecLamTheoGio/Users");
jest.mock("../models/ViecLamTheoGio/JobCategory");
jest.mock("../models/ViecLamTheoGio/City");
jest.mock("../services/functions");

// describe('Unit Test - thongKeUngVien', () => {
//   let req, res;

//   beforeEach(() => {
//     req = {};
//     res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
//     jest.clearAllMocks();
//   });

//   test('TC01 - Thống kê thành công với đầy đủ dữ liệu', async () => {
//     // Mock danh sách ứng viên
//     Users.aggregate.mockResolvedValue([
//       {
//         _id: 1,
//         uv_hinh_thuc: 1,
//         uv_nganh_nghe: '1, 2',
//         uv_dia_diem: '1, 2'
//       },
//       {
//         _id: 2,
//         uv_hinh_thuc: 2,
//         uv_nganh_nghe: '2',
//         uv_dia_diem: '3'
//       },
//       {
//         _id: 3,
//         uv_hinh_thuc: 1,
//         uv_nganh_nghe: '',
//         uv_dia_diem: ''
//       }
//     ]);

//     JobCategory.find.mockResolvedValue([
//       { jc_id: 1, jc_name: 'Kế toán' },
//       { jc_id: 2, jc_name: 'Nhân sự' }
//     ]);

//     City.find.mockResolvedValue([
//       { _id: 1, name: 'Hà Nội' },
//       { _id: 3, name: 'Hồ Chí Minh' }
//     ]);

//     await thongKeUngVien(req, res);

//     expect(functions.success).toHaveBeenCalledWith(
//       res,
//       expect.stringContaining('Thong ke'),
//       expect.objectContaining({
//         totalHinhThuc: [2, 1, 0],
//         totaNganhNghe: expect.arrayContaining([
//           expect.objectContaining({ total: 2 }),
//           expect.objectContaining({ total: 2 })
//         ]),
//         totaTinhThanh: expect.arrayContaining([
//           expect.objectContaining({ _id: 1, total: 1 }),
//           expect.objectContaining({ _id: 3, total: 1 })
//         ])
//       })
//     );
//   });

//   test('TC02 - Không có ứng viên nào', async () => {
//     Users.aggregate.mockResolvedValue([]);
//     JobCategory.find.mockResolvedValue([]);
//     City.find.mockResolvedValue([]);

//     await thongKeUngVien(req, res);

//     expect(functions.success).toHaveBeenCalledWith(
//       res,
//       expect.stringContaining('Thong ke'),
//       {
//         totalHinhThuc: [0, 0, 0],
//         totaNganhNghe: [],
//         totaTinhThanh: []
//       }
//     );
//   });

//   test('TC03 - Ứng viên không có trường uv_nganh_nghe hoặc rỗng', async () => {
//     Users.aggregate.mockResolvedValue([
//       { _id: 1, uv_hinh_thuc: 1, uv_nganh_nghe: '', uv_dia_diem: '' }
//     ]);

//     JobCategory.find.mockResolvedValue([
//       { jc_id: 1, jc_name: 'IT' }
//     ]);

//     City.find.mockResolvedValue([]);

//     await thongKeUngVien(req, res);

//     expect(functions.success).toHaveBeenCalledWith(
//       res,
//       expect.stringContaining('Thong ke'),
//       expect.objectContaining({
//         totalHinhThuc: [1, 0, 0],
//         totaNganhNghe: [{ jc_id: 1, jc_name: 'IT', total: 0 }],
//         totaTinhThanh: []
//       })
//     );
//   });

//   test('TC04 - Ứng viên không có trường uv_dia_diem hoặc rỗng', async () => {
//     Users.aggregate.mockResolvedValue([
//       { _id: 1, uv_hinh_thuc: 2, uv_nganh_nghe: '1', uv_dia_diem: '' }
//     ]);

//     JobCategory.find.mockResolvedValue([]);
//     City.find.mockResolvedValue([{ _id: 1, name: 'HN' }]);

//     await thongKeUngVien(req, res);

//     expect(functions.success).toHaveBeenCalledWith(
//       res,
//       expect.any(String),
//       expect.objectContaining({
//         totalHinhThuc: [0, 1, 0],
//         totaTinhThanh: []
//       })
//     );
//   });

//   test('TC05 - Ứng viên không khớp địa điểm nào trong tỉnh thành => bỏ qua', async () => {
//     Users.aggregate.mockResolvedValue([
//       { _id: 1, uv_hinh_thuc: 3, uv_nganh_nghe: '2', uv_dia_diem: '5' }
//     ]);

//     JobCategory.find.mockResolvedValue([]);
//     City.find.mockResolvedValue([{ _id: 1, name: 'HN' }]); // không khớp

//     await thongKeUngVien(req, res);

//     expect(functions.success).toHaveBeenCalledWith(
//       res,
//       expect.any(String),
//       expect.objectContaining({
//         totalHinhThuc: [0, 0, 1],
//         totaTinhThanh: []
//       })
//     );
//   });

//   test('TC06 - Gặp lỗi exception trong try/catch', async () => {
//     Users.aggregate.mockRejectedValue(new Error('Database error'));

//     await thongKeUngVien(req, res);

//     expect(functions.setError).toHaveBeenCalledWith(res, 'Database error');
//   });
// });



describe('Unit Test - thongKeUngVien', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  test('TKUV_TC01 - Thống kê thành công với dữ liệu đầy đủ', async () => {
    // Mock Users.aggregate
    Users.aggregate.mockResolvedValue([
      {
        _id: 1,
        district: 101,
        city: 1,
        userName: 'Nguyen Van A',
        phone: '0912345678',
        address: 'Hà Nội',
        avatarUser: 'avatar.png',
        createdAt: 1234567890,
        updatedAt: 1234567890,
        uv_cong_viec: 'Nhân viên phục vụ',
        uv_hinh_thuc: 1,
        uv_nganh_nghe: '1, 2',
        uv_dia_diem: '1, 2',
      },
      {
        _id: 2,
        district: 102,
        city: 2,
        userName: 'Tran Thi B',
        phone: '0987654321',
        address: 'TP.HCM',
        avatarUser: 'avatar2.png',
        createdAt: 1234567890,
        updatedAt: 1234567890,
        uv_cong_viec: 'Nhân viên bán hàng',
        uv_hinh_thuc: 2,
        uv_nganh_nghe: '2, 3',
        uv_dia_diem: '2, 3',
      },
    ]);

    // Mock JobCategory.find
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        { jc_id: 1, jc_name: 'Dịch vụ' },
        { jc_id: 2, jc_name: 'Bán hàng' },
      ]),
    });

    // Mock City.find
    City.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: 1, name: 'Hà Nội' },
        { _id: 2, name: 'TP.HCM' },
      ]),
    });

    await thongKeUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Thong ke ung vien theo hinh thuc, nganh nghe, tinh thanh',
      expect.objectContaining({
        totalHinhThuc: [1, 1, 0],
        totaNganhNghe: [
          { jc_id: 1, jc_name: 'Dịch vụ', total: 1 },
          { jc_id: 2, jc_name: 'Bán hàng', total: 2 },
        ],
        totaTinhThanh: [
          { _id: 1, name: 'Hà Nội', total: 1 },
          { _id: 2, name: 'TP.HCM', total: 2 },
        ],
      })
    );
  });

  test('TKUV_TC02 - Thống kê thành công nhưng không có ứng viên', async () => {
    Users.aggregate.mockResolvedValue([]);
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ jc_id: 1, jc_name: 'Dịch vụ' }]),
    });
    City.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ _id: 1, name: 'Hà Nội' }]),
    });

    await thongKeUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Thong ke ung vien theo hinh thuc, nganh nghe, tinh thanh',
      expect.objectContaining({
        totalHinhThuc: [0, 0, 0],
        totaNganhNghe: [{ jc_id: 1, jc_name: 'Dịch vụ', total: 0 }],
        totaTinhThanh: [],
      })
    );
  });

  test('TKUV_TC03 - Thống kê thành công với ứng viên không có CVMM', async () => {
    Users.aggregate.mockResolvedValue([
      {
        _id: 1,
        district: 101,
        city: 1,
        userName: 'Nguyen Van A',
        phone: '0912345678',
        address: 'Hà Nội',
        avatarUser: 'avatar.png',
        createdAt: 1234567890,
        updatedAt: 1234567890,
        uv_cong_viec: null,
        uv_hinh_thuc: null,
        uv_nganh_nghe: null,
        uv_dia_diem: null,
      },
    ]);
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ jc_id: 1, jc_name: 'Dịch vụ' }]),
    });
    City.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ _id: 1, name: 'Hà Nội' }]),
    });

    await thongKeUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Thong ke ung vien theo hinh thuc, nganh nghe, tinh thanh',
      expect.objectContaining({
        totalHinhThuc: [0, 0, 0],
        totaNganhNghe: [{ jc_id: 1, jc_name: 'Dịch vụ', total: 0 }],
        totaTinhThanh: [],
      })
    );
  });

  test('TKUV_TC04 - Thống kê thành công nhưng không có ngành nghề', async () => {
    Users.aggregate.mockResolvedValue([
      {
        _id: 1,
        district: 101,
        city: 1,
        userName: 'Nguyen Van A',
        phone: '0912345678',
        address: 'Hà Nội',
        avatarUser: 'avatar.png',
        createdAt: 1234567890,
        updatedAt: 1234567890,
        uv_cong_viec: 'Nhân viên phục vụ',
        uv_hinh_thuc: 1,
        uv_nganh_nghe: '1',
        uv_dia_diem: '1',
      },
    ]);
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    });
    City.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ _id: 1, name: 'Hà Nội' }]),
    });

    await thongKeUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Thong ke ung vien theo hinh thuc, nganh nghe, tinh thanh',
      expect.objectContaining({
        totalHinhThuc: [1, 0, 0],
        totaNganhNghe: [],
        totaTinhThanh: [{ _id: 1, name: 'Hà Nội', total: 1 }],
      })
    );
  });

  test('TKUV_TC05 - Thống kê thành công nhưng không có tỉnh thành', async () => {
    Users.aggregate.mockResolvedValue([
      {
        _id: 1,
        district: 101,
        city: 1,
        userName: 'Nguyen Van A',
        phone: '0912345678',
        address: 'Hà Nội',
        avatarUser: 'avatar.png',
        createdAt: 1234567890,
        updatedAt: 1234567890,
        uv_cong_viec: 'Nhân viên phục vụ',
        uv_hinh_thuc: 1,
        uv_nganh_nghe: '1',
        uv_dia_diem: '1',
      },
    ]);
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ jc_id: 1, jc_name: 'Dịch vụ' }]),
    });
    City.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    });

    await thongKeUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Thong ke ung vien theo hinh thuc, nganh nghe, tinh thanh',
      expect.objectContaining({
        totalHinhThuc: [1, 0, 0],
        totaNganhNghe: [{ jc_id: 1, jc_name: 'Dịch vụ', total: 1 }],
        totaTinhThanh: [],
      })
    );
  });

  test('TKUV_TC06 - Thống kê thành công với một số tỉnh thành không có ứng viên', async () => {
    Users.aggregate.mockResolvedValue([
      {
        _id: 1,
        district: 101,
        city: 1,
        userName: 'Nguyen Van A',
        phone: '0912345678',
        address: 'Hà Nội',
        avatarUser: 'avatar.png',
        createdAt: 1234567890,
        updatedAt: 1234567890,
        uv_cong_viec: 'Nhân viên phục vụ',
        uv_hinh_thuc: 1,
        uv_nganh_nghe: '1',
        uv_dia_diem: '1',
      },
    ]);
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ jc_id: 1, jc_name: 'Dịch vụ' }]),
    });
    City.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: 1, name: 'Hà Nội' },
        { _id: 2, name: 'TP.HCM' },
      ]),
    });

    await thongKeUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Thong ke ung vien theo hinh thuc, nganh nghe, tinh thanh',
      expect.objectContaining({
        totalHinhThuc: [1, 0, 0],
        totaNganhNghe: [{ jc_id: 1, jc_name: 'Dịch vụ', total: 1 }],
        totaTinhThanh: [{ _id: 1, name: 'Hà Nội', total: 1 }],
      })
    );
  });

  test('TKUV_TC07 - Thống kê thất bại do lỗi trong Users.aggregate', async () => {
    Users.aggregate.mockRejectedValue(new Error('Database error'));

    await thongKeUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Database error');
  });

  test('TKUV_TC08 - Thống kê thất bại do lỗi trong JobCategory.find', async () => {
    Users.aggregate.mockResolvedValue([
      {
        _id: 1,
        district: 101,
        city: 1,
        userName: 'Nguyen Van A',
        phone: '0912345678',
        address: 'Hà Nội',
        avatarUser: 'avatar.png',
        createdAt: 1234567890,
        updatedAt: 1234567890,
        uv_cong_viec: 'Nhân viên phục vụ',
        uv_hinh_thuc: 1,
        uv_nganh_nghe: '1',
        uv_dia_diem: '1',
      },
    ]);
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockRejectedValue(new Error('JobCategory error')),
    });

    await thongKeUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'JobCategory error');
  });

  test('TKUV_TC09 - Thống kê thất bại do lỗi trong City.find', async () => {
    Users.aggregate.mockResolvedValue([
      {
        _id: 1,
        district: 101,
        city: 1,
        userName: 'Nguyen Van A',
        phone: '0912345678',
        address: 'Hà Nội',
        avatarUser: 'avatar.png',
        createdAt: 1234567890,
        updatedAt: 1234567890,
        uv_cong_viec: 'Nhân viên phục vụ',
        uv_hinh_thuc: 1,
        uv_nganh_nghe: '1',
        uv_dia_diem: '1',
      },
    ]);
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ jc_id: 1, jc_name: 'Dịch vụ' }]),
    });
    City.find.mockReturnValue({
      lean: jest.fn().mockRejectedValue(new Error('City error')),
    });

    await thongKeUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'City error');
  });

  test('TKUV_TC10 - Thống kê thành công với uv_nganh_nghe hoặc uv_dia_diem rỗng', async () => {
    Users.aggregate.mockResolvedValue([
      {
        _id: 1,
        district: 101,
        city: 1,
        userName: 'Nguyen Van A',
        phone: '0912345678',
        address: 'Hà Nội',
        avatarUser: 'avatar.png',
        createdAt: 1234567890,
        updatedAt: 1234567890,
        uv_cong_viec: 'Nhân viên phục vụ',
        uv_hinh_thuc: 1,
        uv_nganh_nghe: '',
        uv_dia_diem: '',
      },
    ]);
    JobCategory.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ jc_id: 1, jc_name: 'Dịch vụ' }]),
    });
    City.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ _id: 1, name: 'Hà Nội' }]),
    });

    await thongKeUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Thong ke ung vien theo hinh thuc, nganh nghe, tinh thanh',
      expect.objectContaining({
        totalHinhThuc: [1, 0, 0],
        totaNganhNghe: [{ jc_id: 1, jc_name: 'Dịch vụ', total: 0 }],
        totaTinhThanh: [],
      })
    );
  });
});