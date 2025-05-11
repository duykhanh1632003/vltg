const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../app");

const Users = require("../../models/ViecLamTheoGio/Users");
const UvCvmm = require("../../models/ViecLamTheoGio/UvCvmm");
const JobCategory = require("../../models/ViecLamTheoGio/JobCategory");
const City2 = require("../../models/ViecLamTheoGio/City2");

jest.setTimeout(20000);

const userId = 666;

jest.spyOn(require("../../services/functions"), "checkToken").mockImplementation((req, res, next) => {
  req.user = { data: { _id: userId } };
  next();
});

// ✅ mock để luôn pass middleware checkCandidate và gán req.candidate
jest.spyOn(require("../../services/functions"), "checkCandidate").mockImplementation((req, res, next) => {
  req.candidate = { _id: userId };
  next();
});

beforeAll(async () => {
  await mongoose.connect("mongodb://vltg:123123@54.179.255.126:27067/vltg?authSource=admin");

  await Users.deleteOne({ _id: userId });
  await UvCvmm.deleteOne({ id_uv_cvmm: userId });
  await JobCategory.deleteMany({ jc_id: { $in: [1, 2] } });
  await City2.deleteMany({ cit_id: { $in: [101, 102] } });

  await Users.create({
    _id: userId,
    email: "test@email.com",
    password: "testpassword",
    type: 0, // ứng viên
  });

  await UvCvmm.create({
    id_uv_cvmm: userId,
    cong_viec: "Tester",
    nganh_nghe: "1, 2",
    dia_diem: "101, 102",
    lever: "1",
    hinh_thuc: 2,
    luong: 8000000,
  });

  await JobCategory.insertMany([
    { jc_id: 1, jc_name: "IT" },
    { jc_id: 2, jc_name: "Marketing" },
  ]);

  await City2.insertMany([
    { cit_id: 101, cit_name: "Hà Nội", cit_parent: 0 },
    { cit_id: 102, cit_name: "HCM", cit_parent: 0 },
  ]);
});

afterAll(async () => {
  await Users.deleteOne({ _id: userId });
  await UvCvmm.deleteOne({ id_uv_cvmm: userId });
  await mongoose.disconnect();
});

describe("POST /api/vltg/manageAccountCandidate/getCongViecMongMuon", () => {
  it("✅ Nên lấy thông tin công việc mong muốn của ứng viên", async () => {
    const res = await request(app)
      .post("/api/vltg/manageAccountCandidate/getCongViecMongMuon")
      .send();

    if (res.status !== 200) {
      console.error("❌ Server returned error:", res.status, res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("get info cong viec mong muon thanh cong");

    const cvmm = res.body.data.data;
    expect(cvmm).toBeDefined();
    expect(cvmm.cong_viec).toBe("Tester");
    expect(cvmm.nganh_nghe).toBe("1, 2");
    expect(cvmm.dia_diem).toBe("101, 102");
    expect(cvmm.name_job).toEqual(expect.arrayContaining(["IT", "Marketing"]));
    expect(cvmm.name_city).toEqual(expect.arrayContaining(["Hà Nội", "HCM"]));
  });
});
