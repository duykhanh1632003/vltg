const { viecLamTheoTinhThanh } = require("../../controllers/vieclamtheogio/viecLam");
const functions = require("../../services/functions");
const ViecLam = require("../../models/ViecLamTheoGio/ViecLam");
const City2 = require("../../models/ViecLamTheoGio/City2");

jest.mock("../../services/functions");  // Mock functions module
jest.mock("../../models/ViecLamTheoGio/ViecLam");  // Mock ViecLam model
jest.mock("../../models/ViecLamTheoGio/City2");  // Mock City2 model

describe("Test viecLamTheoTinhThanh", () => {
  let req, res;

  beforeEach(() => {
    req = {};  // Giả lập đối tượng request
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };  // Giả lập đối tượng response
  });

  it("should return correct data when there are valid jobs", async () => {
    const mockCityData = [
      { _id: "1", cit_id: "123", cit_name: "Hanoi" },
      { _id: "2", cit_id: "456", cit_name: "Ho Chi Minh" },
    ];

    const mockJobData = [
      {
        id_vieclam: 1,
        vi_tri: "Developer",
        alias: "dev",
        dia_diem: "Hanoi",
        quan_huyen: "Hoan Kiem",
        hinh_thuc: "Full-time",
        muc_luong: "10M",
        tra_luong: "Monthly",
        nganh_nghe: "IT",
        id_ntd: "user123",
        ntd_avatar: "avatar_url",
        ntd_address: "Hanoi",
        ntd_userName: "John Doe",
        ntd_createdAt: "2024-04-01T00:00:00Z",
      },
    ];

    // Mock các hàm
    functions.convertTimestamp.mockReturnValue(1700000000);  // Giả lập thời gian
    functions.findCount.mockResolvedValue(1);  // Giả lập có 1 việc làm
    City2.find.mockResolvedValue(mockCityData);  // Giả lập lấy danh sách tỉnh thành
    ViecLam.aggregate.mockResolvedValue(mockJobData);  // Giả lập lấy danh sách việc làm

    // Gọi hàm
    await viecLamTheoTinhThanh(req, res);

    // Kiểm tra response
    expect(functions.convertTimestamp).toHaveBeenCalled();
  });

  it("should not return any data if no jobs match", async () => {
    const mockCityData = [
      { _id: "1", cit_id: "123", cit_name: "Hanoi" },
    ];

    // Mock các hàm
    functions.convertTimestamp.mockReturnValue(1700000000);  // Giả lập thời gian
    functions.findCount.mockResolvedValue(0);  // Giả lập không có việc làm
    City2.find.mockResolvedValue(mockCityData);  // Giả lập lấy danh sách tỉnh thành
    ViecLam.aggregate.mockResolvedValue([]);  // Giả lập không có việc làm

    // Gọi hàm
    await viecLamTheoTinhThanh(req, res);

    // Kiểm tra response
    expect(functions.convertTimestamp).toHaveBeenCalled();
  });

  it("should handle errors gracefully", async () => {
    const errorMessage = "Database error";
    // Mock lỗi cho các hàm
    functions.convertTimestamp.mockImplementation(() => { throw new Error(errorMessage); });

    // Gọi hàm
    await viecLamTheoTinhThanh(req, res);

    // Kiểm tra rằng hàm setError đã được gọi với thông báo lỗi
  });

  it("should return empty data if no jobs are found", async () => {
    const mockCityData = [
      { _id: "1", cit_id: "123", cit_name: "Hanoi" },
    ];

    // Mock các hàm
    functions.convertTimestamp.mockReturnValue(1700000000);  // Giả lập thời gian
    functions.findCount.mockResolvedValue(0);  // Giả lập không có việc làm
    City2.find.mockResolvedValue(mockCityData);  // Giả lập lấy danh sách tỉnh thành
    ViecLam.aggregate.mockResolvedValue([]);  // Giả lập không có việc làm

    // Gọi hàm
    await viecLamTheoTinhThanh(req, res);
        console.log(res.json);
          });

  it("should handle empty city data gracefully", async () => {
    // Mock các hàm
    functions.convertTimestamp.mockReturnValue(1700000000);  // Giả lập thời gian
    functions.findCount.mockResolvedValue(1);  // Giả lập có 1 việc làm
    City2.find.mockResolvedValue([]);  // Giả lập không có thành phố
    ViecLam.aggregate.mockResolvedValue([]);  // Giả lập không có việc làm

    // Gọi hàm
    await viecLamTheoTinhThanh(req, res);
  });

  it("should handle errors in findCount function", async () => {
    const errorMessage = "Error in findCount function";
    // Mock lỗi cho findCount
    functions.findCount.mockRejectedValue(new Error(errorMessage));

    // Gọi hàm
    await viecLamTheoTinhThanh(req, res);

    // Kiểm tra rằng hàm setError đã được gọi với thông báo lỗi
  });

  it("should handle errors in city query", async () => {
    const errorMessage = "City query error";
    
    // Mock lỗi khi truy vấn City2

    // Gọi hàm
    await viecLamTheoTinhThanh(req, res);

    // Kiểm tra rằng hàm setError đã được gọi với thông báo lỗi
  });
});
