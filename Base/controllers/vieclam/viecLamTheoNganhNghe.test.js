// tests/controllers/vieclamTheoHinhThuc.test.js
const { viecLamTheoHinhThuc, viecLamTheoNganhNghe } = require('../vieclamtheogio/viecLam');
const functions = require('../../services/functions');
const ViecLam = require('../../models/ViecLamTheoGio/ViecLam');
const Users = require('../../models/ViecLamTheoGio/Users');
const JobCategory = require('../../models/ViecLamTheoGio/JobCategory');

jest.mock('../../services/functions');
jest.mock('../../models/ViecLamTheoGio/ViecLam');
jest.mock('../../models/ViecLamTheoGio/Users');
jest.mock('../../models/ViecLamTheoGio/JobCategory');

describe('viecLamTheoHinhThuc - controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  it('TC01 - Trả về đúng data với 3 hình thức', async () => {
    const mockTime = 1700000000;
    functions.convertTimestamp.mockReturnValue(mockTime);

    functions.findCount
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(1);

    ViecLam.aggregate
      .mockResolvedValueOnce([
        {
          id_vieclam: 3,
          vi_tri: 'Kế toán',
          alias: 'ke-toan',
          dia_diem: 'HN',
          quan_huyen: 'Ba Đình',
          hinh_thuc: 1,
          muc_luong: '10tr',
          tra_luong: 1,
          nganh_nghe: 'Kế toán',
          id_ntd: 1,
          ntd_avatar: 'avatar1.jpg',
          ntd_address: 'Hà Nội',
          ntd_userName: 'Công ty A',
          ntd_createdAt: '2024-04-01',
        },
        {
          id_vieclam: 2,
          vi_tri: 'NV bán hàng',
          alias: 'ban-hang',
          dia_diem: 'HN',
          quan_huyen: 'Cầu Giấy',
          hinh_thuc: 1,
          muc_luong: '7tr',
          tra_luong: 1,
          nganh_nghe: 'Bán hàng',
          id_ntd: 2,
          ntd_avatar: 'avatar2.jpg',
          ntd_address: 'Hà Nội',
          ntd_userName: 'Công ty B',
          ntd_createdAt: '2024-03-20',
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id_vieclam: 1,
          vi_tri: 'Tester',
          alias: 'tester',
          dia_diem: 'HCM',
          quan_huyen: 'Q1',
          hinh_thuc: 3,
          muc_luong: '15tr',
          tra_luong: 3,
          nganh_nghe: 'CNTT',
          id_ntd: null,
          ntd_avatar: null,
          ntd_address: null,
          ntd_userName: null,
          ntd_createdAt: null,
        },
      ]);

    await viecLamTheoHinhThuc(req, res);

    expect(functions.success).toHaveBeenCalledWith(res, expect.any(String), {
      data: expect.arrayContaining([
        expect.objectContaining({
          total: 2,
          danhSachVieclam: expect.arrayContaining([
            expect.objectContaining({ hinh_thuc: 1 }),
          ]),
        }),
        expect.objectContaining({ total: 0, danhSachVieclam: [] }),
        expect.objectContaining({
          total: 1,
          danhSachVieclam: expect.arrayContaining([
            expect.objectContaining({ hinh_thuc: 3 }),
          ]),
        }),
      ]),
    });
  });

  it('TC02 - DB lỗi hoặc Mongo dừng hoạt động', async () => {
    const error = new Error('Mongo crashed');
    functions.convertTimestamp.mockReturnValue(1700000000);
    functions.findCount.mockRejectedValue(error);

    await viecLamTheoHinhThuc(req, res);

    expect(functions.setError).toHaveBeenCalledWith(res, error.message);
  });

  it('TC03 - Mỗi danh sách có total === length của danhSachVieclam', async () => {
    functions.convertTimestamp.mockReturnValue(1700000000);
    functions.findCount.mockResolvedValue(1);

    ViecLam.aggregate.mockResolvedValue([
      {
        id_vieclam: 1,
        hinh_thuc: 1,
        vi_tri: 'IT Support',
        ntd_userName: 'Tên công ty',
        ntd_address: 'HN',
        ntd_createdAt: '2024-01-01',
        ntd_avatar: 'ava.jpg',
      },
    ]);

    await viecLamTheoHinhThuc(req, res);

    const calledData = functions.success.mock.calls[0][2].data;
    for (let d of calledData) {
      expect(d.total).toBe(d.danhSachVieclam.length);
    }
  });
});

describe('viecLamTheoNganhNghe - controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it('TC01 - Trả về đúng 10 ngành với danh sách việc làm hợp lệ', async () => {
    const mockTime = 1700000000;
    functions.convertTimestamp.mockReturnValue(mockTime);

    JobCategory.find.mockResolvedValue([
      { jc_id: '1', jc_name: 'Kế toán' },
      { jc_id: '2', jc_name: 'CNTT' },
      { jc_id: '3', jc_name: 'Bán hàng' },
      { jc_id: '4', jc_name: 'Marketing' },
      { jc_id: '5', jc_name: 'Kỹ thuật' },
      { jc_id: '6', jc_name: 'Xây dựng' },
      { jc_id: '7', jc_name: 'Giáo dục' },
      { jc_id: '8', jc_name: 'Du lịch' },
      { jc_id: '9', jc_name: 'Ngân hàng' },
      { jc_id: '10', jc_name: 'Bảo hiểm' },
    ]);

    functions.findCount.mockResolvedValue(1);
    ViecLam.aggregate.mockResolvedValue([
      {
        id_vieclam: 100,
        vi_tri: 'Nhân viên',
        alias: 'nhan-vien',
        dia_diem: 'HN',
        quan_huyen: 'Thanh Xuân',
        hinh_thuc: 1,
        muc_luong: '10tr',
        tra_luong: 1,
        nganh_nghe: '1,2',
        id_ntd: 10,
        ntd_avatar: 'ava.jpg',
        ntd_address: 'Hà Nội',
        ntd_userName: 'Công ty ABC',
        ntd_createdAt: '2024-01-01',
      },
    ]);

    await viecLamTheoNganhNghe(req, res);

    const calledData = functions.success.mock.calls[0][2].data;

    expect(calledData.length).toBe(10);
    for (let nganh of calledData) {
      expect(nganh).toHaveProperty('jc_id');
      expect(nganh).toHaveProperty('jc_name');
      expect(nganh).toHaveProperty('total');
      expect(nganh).toHaveProperty('danhSachVieclam');
      if (nganh.total > 0) {
        for (let vieclam of nganh.danhSachVieclam) {
          expect(vieclam.nganh_nghe).toContain(nganh.jc_id);
          expect(vieclam).toHaveProperty('ntd_avatar');
          expect(vieclam).toHaveProperty('ntd_userName');
          expect(vieclam).toHaveProperty('ntd_address');
          expect(vieclam).toHaveProperty('ntd_createdAt');
        }
      }
      expect(nganh.total).toBe(nganh.danhSachVieclam.length);
    }
  });

  
  it('TC04 - Trả về data hợp lệ với các yêu cầu', async () => {
    const mockTime = 1700000000;
    functions.convertTimestamp.mockReturnValue(mockTime);
  
    // Mock dữ liệu ngành nghề
    JobCategory.find.mockResolvedValue([
      { jc_id: '1', jc_name: 'Kế toán' },
      { jc_id: '2', jc_name: 'CNTT' },
      { jc_id: '3', jc_name: 'Bán hàng' },
      { jc_id: '4', jc_name: 'Marketing' },
      { jc_id: '5', jc_name: 'Kỹ thuật' },
      { jc_id: '6', jc_name: 'Xây dựng' },
      { jc_id: '7', jc_name: 'Giáo dục' },
      { jc_id: '8', jc_name: 'Du lịch' },
      { jc_id: '9', jc_name: 'Ngân hàng' },
      { jc_id: '10', jc_name: 'Bảo hiểm' },
    ]);
  
    // Mock số lượng việc làm
    functions.findCount.mockResolvedValue(1);
  
    // Mock dữ liệu việc làm
    ViecLam.aggregate.mockResolvedValue([
      {
        id_vieclam: 100,
        vi_tri: 'Nhân viên',
        alias: 'nhan-vien',
        dia_diem: 'HN',
        quan_huyen: 'Thanh Xuân',
        hinh_thuc: 1,
        muc_luong: '10tr',
        tra_luong: 1,
        nganh_nghe: '1,2',
        time_td: 1700000000 - 3600,  // 1 hour before now
        active: 1,
        id_ntd: 10,
        ntd_avatar: 'ava.jpg',
        ntd_userName: 'Công ty ABC',
        ntd_address: 'Hà Nội',
        ntd_createdAt: '2024-01-01',
      },
      {
        id_vieclam: 101,
        vi_tri: 'Nhân viên Bán hàng',
        alias: 'ban-hang',
        dia_diem: 'HCM',
        quan_huyen: 'Q1',
        hinh_thuc: 2,
        muc_luong: '12tr',
        tra_luong: 2,
        nganh_nghe: '3,4',
        time_td: 1700000000 - 86400,  // 1 day before now
        active: 1,
        id_ntd: 11,
        ntd_avatar: 'ava2.jpg',
        ntd_userName: 'Công ty XYZ',
        ntd_address: 'HCM',
        ntd_createdAt: '2024-02-01',
      },
    ]);
  
    await viecLamTheoNganhNghe(req, res);
  
    const calledData = functions.success.mock.calls[0][2].data;
  
    // Kiểm tra số lượng ngành nghề trả về
    expect(calledData.length).toBe(10);
  
    // Kiểm tra các yêu cầu trong mỗi ngành nghề
    for (let nganh of calledData) {
      expect(nganh).toHaveProperty('jc_id');
      expect(nganh).toHaveProperty('jc_name');
      expect(nganh).toHaveProperty('total');
      expect(nganh).toHaveProperty('danhSachVieclam');
  
      // Kiểm tra danh sách việc làm trong mỗi ngành
      if (nganh.total > 0) {
        // Kiểm tra time_td > time hiện tại - 86400
        for (let vieclam of nganh.danhSachVieclam) {
          expect(vieclam.time_td).toBeGreaterThan(mockTime - 86400);
          
          // Kiểm tra không có việc làm nào có active === 0
          expect(vieclam.active).toBe(1);
          
          // Kiểm tra mỗi ngành nghề chứa jc_id trong nganh_nghe
          expect(vieclam.nganh_nghe).toContain(nganh.jc_id.toString());
          
          // Kiểm tra các trường nhà tuyển dụng
          if (vieclam.id_ntd) {
            expect(vieclam).toHaveProperty('ntd_avatar');
            expect(vieclam).toHaveProperty('ntd_userName');
            expect(vieclam).toHaveProperty('ntd_address');
            expect(vieclam).toHaveProperty('ntd_createdAt');
          }
        }
  
        // Kiểm tra sắp xếp theo id_vieclam giảm dần
        const sortedDanhSach = nganh.danhSachVieclam.sort((a, b) => b.id_vieclam - a.id_vieclam);
        expect(nganh.danhSachVieclam).toEqual(sortedDanhSach);
  
        // Kiểm tra total === danhSachVieclam.length
        expect(nganh.total).toBe(nganh.danhSachVieclam.length);
      }
  
      // Kiểm tra ngành có total === 0 và danhSachVieclam = []
      if (nganh.total === 0) {
        expect(nganh.danhSachVieclam).toEqual([]);
      }
    }
  });
  
});