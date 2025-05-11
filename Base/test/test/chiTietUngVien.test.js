const { chiTietUngVien } = require("../controllers/vieclamtheogio/manageAccountCompany");
const functions = require("../services/functions");

const Users = require("../models/ViecLamTheoGio/Users");
const JobCategory = require("../models/ViecLamTheoGio/JobCategory");
const XemUv = require("../models/ViecLamTheoGio/XemUv");
const NtdSaveUv = require("../models/ViecLamTheoGio/NtdSaveUv");
const NtdXemUv = require("../models/ViecLamTheoGio/NtdXemUv");

jest.mock("../models/ViecLamTheoGio/Users");
jest.mock("../models/ViecLamTheoGio/JobCategory");
jest.mock("../models/ViecLamTheoGio/XemUv");
jest.mock("../models/ViecLamTheoGio/NtdSaveUv");
jest.mock("../models/ViecLamTheoGio/NtdXemUv");
jest.mock("../services/functions");

describe('Unit Test - chiTietUngVien', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { id_uv: '1' },
      user: { data: { _id: 100 } },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    functions.convertTimestamp.mockReturnValue(1234567890);
    functions.getLinkFile.mockReturnValue('http://example.com/avatar.png');
  });

  test('CTUV_TC01 - Xem chi tiết ứng viên thành công với dữ liệu đầy đủ', async () => {
    Users.findOne.mockResolvedValue({
      _id: 1,
      type: 0,
      luot_xem: 5,
    });
    functions.getMaxIdByField.mockResolvedValue(1001);
    XemUv.findOne.mockResolvedValue(null);
    XemUv.findOneAndUpdate.mockResolvedValue({});
    Users.findOneAndUpdate.mockResolvedValue({});
    Users.aggregate
      .mockResolvedValueOnce([
        {
          _id: 1,
          district: 101,
          city: 1,
          userName: 'Nguyen Van A',
          phone: '0912345678',
          email: 'test@example.com',
          address: 'Hà Nội',
          avatarUser: 'avatar.png',
          createdAt: 1234567890,
          updatedAt: 1234567890,
          birthday: 946684800,
          gender: 1,
          married: 0,
          experience: 2,
          education: 3,
          uv_day: '2,4',
          uv_search: 1,
          luot_xem: 6,
          diem_free: 10,
          diem_mua: 5,
          uv_cong_viec: 'Nhân viên phục vụ',
          uv_nganh_nghe: '1,2',
          uv_dia_diem: '1,2',
          uv_lever: 'Nhân viên',
          uv_hinh_thuc: 1,
          uv_luong: 50000,
          uv_ky_nang: 'Giao tiếp',
          KNLV: [{ id: 1, skill: 'Làm việc nhóm' }],
        },
      ])
      .mockResolvedValueOnce([
        {
          _id: 2,
          userName: 'Tran Thi B',
          uv_cong_viec: 'Nhân viên bán hàng',
          uv_nganh_nghe: '1',
        },
      ]);
    JobCategory.findOne
      .mockResolvedValueOnce({ jc_id: 1, jc_name: 'Dịch vụ' })
      .mockResolvedValueOnce({ jc_id: 2, jc_name: 'Bán hàng' });
    NtdSaveUv.findOne.mockResolvedValue({ id: 1 });
    NtdXemUv.findOne.mockResolvedValue({ id: 1 });

    await chiTietUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Xem chi tiet ung vien thanh cong',
      expect.objectContaining({
        data: expect.objectContaining({
          _id: 1,
          userName: 'Nguyen Van A',
          arrNameNN: [
            { jc_id: 1, jc_name: 'Dịch vụ' },
            { jc_id: 2, jc_name: 'Bán hàng' },
          ],
          linkAvatar: 'http://example.com/avatar.png',
          check_save_uv: true,
          check_xem_uv: true,
        }),
        listUVLienQuan: expect.arrayContaining([
          expect.objectContaining({ _id: 2, userName: 'Tran Thi B' }),
        ]),
      })
    );
    // expect(functions.success).toHaveBeenCalledWith(
    //   res,
    //   'Xem chi tiet ung vien thanh cong',
    //   expect.objectContaining({
    //     data: expect.objectContaining({
    //       _id: 1,
    //       userName: 'Nguyen Van A',
    //       arrNameNN: [{ jc_id: 1, jc_name: 'Dịch vụ' }],
    //     }),
    //     listUVLienQuan: expect.arrayContaining([
    //             expect.objectContaining({ _id: 2, userName: 'Tran Thi B' }),
    //           ]),
    //   })
    
    // );
  });

  test('CTUV_TC02 - Xem chi tiết ứng viên thành công nhưng không có id_ntd', async () => {
    req.user = null;
    Users.findOne.mockResolvedValue({
      _id: 1,
      type: 0,
      luot_xem: 5,
    });
    XemUv.findOne.mockResolvedValue(null);
    XemUv.findOneAndUpdate.mockResolvedValue({});
    Users.findOneAndUpdate.mockResolvedValue({});
    Users.aggregate
      .mockResolvedValueOnce([
        {
          _id: 1,
          userName: 'Nguyen Van A',
          uv_nganh_nghe: '1',
        },
      ])
      .mockResolvedValueOnce([]);
    JobCategory.findOne.mockResolvedValue({ jc_id: 1, jc_name: 'Dịch vụ' });
    NtdSaveUv.findOne.mockResolvedValue(null);
    NtdXemUv.findOne.mockResolvedValue(null);

    await chiTietUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Xem chi tiet ung vien thanh cong',
      expect.objectContaining({
        data: expect.objectContaining({
          _id: 1,
          userName: 'Nguyen Van A',
          arrNameNN: [{ jc_id: 1, jc_name: 'Dịch vụ' }],
          check_save_uv: false,
          check_xem_uv: false,
          email: undefined,
          phone: undefined,
        }),
        listUVLienQuan: [],
      })
    );
  });

  test('CTUV_TC03 - Xem chi tiết ứng viên thành công nhưng chưa được xem hoặc lưu', async () => {
    Users.findOne.mockResolvedValue({
      _id: 1,
      type: 0,
      luot_xem: 5,
    });
    functions.getMaxIdByField.mockResolvedValue(1001);
    XemUv.findOne.mockResolvedValue(null);
    XemUv.findOneAndUpdate.mockResolvedValue({});
    Users.findOneAndUpdate.mockResolvedValue({});
    Users.aggregate
      .mockResolvedValueOnce([
        {
          _id: 1,
          userName: 'Nguyen Van A',
          uv_nganh_nghe: '1',
        },
      ])
      .mockResolvedValueOnce([]);
    JobCategory.findOne.mockResolvedValue({ jc_id: 1, jc_name: 'Dịch vụ' });
    NtdSaveUv.findOne.mockResolvedValue(null);
    NtdXemUv.findOne.mockResolvedValue(null);

    await chiTietUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Xem chi tiet ung vien thanh cong',
      expect.objectContaining({
        data: expect.objectContaining({
          _id: 1,
          userName: 'Nguyen Van A',
          check_save_uv: false,
          check_xem_uv: false,
          email: undefined,
          phone: undefined,
        }),
        listUVLienQuan: [],
      })
    );
  });

  test('CTUV_TC04 - Xem chi tiết ứng viên thành công với CVMM rỗng', async () => {
    Users.findOne.mockResolvedValue({
      _id: 1,
      type: 0,
      luot_xem: 5,
    });
    functions.getMaxIdByField.mockResolvedValue(1001);
    XemUv.findOne.mockResolvedValue(null);
    XemUv.findOneAndUpdate.mockResolvedValue({});
    Users.findOneAndUpdate.mockResolvedValue({});
    Users.aggregate
      .mockResolvedValueOnce([
        {
          _id: 1,
          userName: 'Nguyen Van A',
          uv_nganh_nghe: null,
          uv_cong_viec: null,
          CVMM: null,
        },
      ])
      .mockResolvedValueOnce([]);
    JobCategory.findOne.mockResolvedValue(null);
    NtdSaveUv.findOne.mockResolvedValue(null);
    NtdXemUv.findOne.mockResolvedValue(null);

    await chiTietUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Xem chi tiet ung vien thanh cong',
      expect.objectContaining({
        data: expect.objectContaining({
          _id: 1,
          userName: 'Nguyen Van A',
          arrNameNN: [],
          check_save_uv: false,
          check_xem_uv: false,
        }),
        listUVLienQuan: [],
      })
    );
  });

  test('CTUV_TC05 - Xem chi tiết ứng viên thành công với nganhNghe rỗng', async () => {
    Users.findOne.mockResolvedValue({
      _id: 1,
      type: 0,
      luot_xem: 5,
    });
    functions.getMaxIdByField.mockResolvedValue(1001);
    XemUv.findOne.mockResolvedValue(null);
    XemUv.findOneAndUpdate.mockResolvedValue({});
    Users.findOneAndUpdate.mockResolvedValue({});
    Users.aggregate
      .mockResolvedValueOnce([
        {
          _id: 1,
          userName: 'Nguyen Van A',
          uv_nganh_nghe: '',
        },
      ])
      .mockResolvedValueOnce([]);
    JobCategory.findOne.mockResolvedValue(null);
    NtdSaveUv.findOne.mockResolvedValue(null);
    NtdXemUv.findOne.mockResolvedValue(null);

    await chiTietUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Xem chi tiet ung vien thanh cong',
      expect.objectContaining({
        data: expect.objectContaining({
          _id: 1,
          userName: 'Nguyen Van A',
          arrNameNN: [],
          check_save_uv: false,
          check_xem_uv: false,
        }),
        listUVLienQuan: [],
      })
    );
  });

  test('CTUV_TC06 - Xem chi tiết ứng viên thành công nhưng không có ứng viên liên quan', async () => {
    Users.findOne.mockResolvedValue({
      _id: 1,
      type: 0,
      luot_xem: 5,
    });
    functions.getMaxIdByField.mockResolvedValue(1001);
    XemUv.findOne.mockResolvedValue(null);
    XemUv.findOneAndUpdate.mockResolvedValue({});
    Users.findOneAndUpdate.mockResolvedValue({});
    Users.aggregate
      .mockResolvedValueOnce([
        {
          _id: 1,
          userName: 'Nguyen Van A',
          uv_nganh_nghe: '1',
        },
      ])
      .mockResolvedValueOnce([]);
    JobCategory.findOne.mockResolvedValue({ jc_id: 1, jc_name: 'Dịch vụ' });
    NtdSaveUv.findOne.mockResolvedValue(null);
    NtdXemUv.findOne.mockResolvedValue(null);

    await chiTietUngVien(req, res);

    expect(functions.success).toHaveBeenCalledWith(
      res,
      'Xem chi tiet ung vien thanh cong',
      expect.objectContaining({
        data: expect.objectContaining({
          _id: 1,
          userName: 'Nguyen Van A',
          arrNameNN: [{ jc_id: 1, jc_name: 'Dịch vụ' }],
        }),
        listUVLienQuan: [],
      })
    );
  });

  test('CTUV_TC07 - Thất bại do thiếu id_uv', async () => {
    req.body.id_uv = null;

    await chiTietUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Missing input id_uv!', 405);
  });

  test('CTUV_TC08 - Thất bại do không tìm thấy ứng viên', async () => {
    Users.findOne.mockResolvedValue(null);

    await chiTietUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Ung vien not found!', 404);
  });

  test('CTUV_TC09 - Thất bại do lỗi trong Users.findOne', async () => {
    Users.findOne.mockRejectedValue(new Error('Database error'));

    await chiTietUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Database error');
  });

  test('CTUV_TC10 - Thất bại do lỗi trong XemUv.findOneAndUpdate', async () => {
    Users.findOne.mockResolvedValue({
      _id: 1,
      type: 0,
      luot_xem: 5,
    });
    functions.getMaxIdByField.mockResolvedValue(1001);
    XemUv.findOne.mockResolvedValue(null);
    XemUv.findOneAndUpdate.mockRejectedValue(new Error('XemUv error'));

    await chiTietUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'XemUv error');
  });

  test('CTUV_TC11 - Thất bại do lỗi trong Users.aggregate (thông tin chi tiết)', async () => {
    Users.findOne.mockResolvedValue({
      _id: 1,
      type: 0,
      luot_xem: 5,
    });
    functions.getMaxIdByField.mockResolvedValue(1001);
    XemUv.findOne.mockResolvedValue(null);
    XemUv.findOneAndUpdate.mockResolvedValue({});
    Users.findOneAndUpdate.mockResolvedValue({});
    Users.aggregate.mockRejectedValue(new Error('Aggregate error'));

    await chiTietUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Aggregate error');
  });

  test('CTUV_TC12 - Thất bại do lỗi trong JobCategory.findOne', async () => {
    Users.findOne.mockResolvedValue({
      _id: 1,
      type: 0,
      luot_xem: 5,
    });
    functions.getMaxIdByField.mockResolvedValue(1001);
    XemUv.findOne.mockResolvedValue(null);
    XemUv.findOneAndUpdate.mockResolvedValue({});
    Users.findOneAndUpdate.mockResolvedValue({});
    Users.aggregate.mockResolvedValueOnce([
      {
        _id: 1,
        userName: 'Nguyen Van A',
        uv_nganh_nghe: '1',
      },
    ]);
    JobCategory.findOne.mockRejectedValue(new Error('JobCategory error'));

    await chiTietUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'JobCategory error');
  });

  test('CTUV_TC13 - Thất bại do lỗi trong Users.aggregate (ứng viên liên quan)', async () => {
    Users.findOne.mockResolvedValue({
      _id: 1,
      type: 0,
      luot_xem: 5,
    });
    functions.getMaxIdByField.mockResolvedValue(1001);
    XemUv.findOne.mockResolvedValue(null);
    XemUv.findOneAndUpdate.mockResolvedValue({});
    Users.findOneAndUpdate.mockResolvedValue({});
    Users.aggregate
      .mockResolvedValueOnce([
        {
          _id: 1,
          userName: 'Nguyen Van A',
          uv_nganh_nghe: '1',
        },
      ])
      .mockRejectedValue(new Error('Aggregate related error'));
    JobCategory.findOne.mockResolvedValue({ jc_id: 1, jc_name: 'Dịch vụ' });
    NtdSaveUv.findOne.mockResolvedValue(null);
    NtdXemUv.findOne.mockResolvedValue(null);

    await chiTietUngVien(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, 'Aggregate related error');
  });
});
