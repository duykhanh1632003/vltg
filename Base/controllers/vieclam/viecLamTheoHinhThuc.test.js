// tests/controllers/vieclamTheoHinhThuc.test.js
const { viecLamTheoHinhThuc } = require('../../controllers/vieclamtheogio/viecLam');
const functions = require('../../services/functions');
const ViecLam = require('../../models/ViecLamTheoGio/ViecLam');
const Users = require('../../models/ViecLamTheoGio/Users');

jest.mock('../../services/functions');
jest.mock('../../models/ViecLamTheoGio/ViecLam');
jest.mock('../../models/ViecLamTheoGio/Users');

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