const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

beforeAll(async () => {
  await mongoose.connect(
    "mongodb://vltg:123123@54.179.255.126:27067/vltg?authSource=admin",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
}, 20000);

afterAll(async () => {
  await mongoose.disconnect();
}, 10000);

describe("POST /api/vltg/manageAccountCandidate/danhSachNganhNghe", () => {
  it(
    "Nên trả về danh sách ngành nghề jc_active = 1 và jc_parent > 0 khi type = 1",
    async () => {
      const res = await request(app)
        .post("/api/vltg/manageAccountCandidate/danhSachNganhNghe")
        .send({ type: 1 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(typeof res.body.data).toBe("object");
      expect(Array.isArray(res.body.data.data)).toBe(true);
      expect(typeof res.body.data.total).toBe("number");

      // Kiểm tra từng phần tử nếu có
      for (const item of res.body.data.data) {
        expect(item).toHaveProperty("jc_active", 1);
        expect(item.jc_parent).toBeGreaterThan(0);
      }
    },
    15000
  );
});
