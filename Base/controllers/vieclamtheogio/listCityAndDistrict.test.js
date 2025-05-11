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

describe("POST /api/vltg/manageAccountCandidate/listCityAndDistrict", () => {
  it(
    "Nên trả về danh sách quận/huyện (cit_parent > 0) khi type = 1",
    async () => {
      const res = await request(app)
        .post("/api/vltg/manageAccountCandidate/listCityAndDistrict")
        .send({ type: 1 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(typeof res.body.data).toBe("object");
      expect(Array.isArray(res.body.data.data)).toBe(true);
      expect(typeof res.body.data.total).toBe("number");

      // Kiểm tra mỗi phần tử trong data
      for (const item of res.body.data.data) {
        expect(item).toHaveProperty("cit_id");
        expect(item).toHaveProperty("cit_name");
        expect(item).toHaveProperty("cit_ndgy");
        expect(item.cit_id).toBeGreaterThan(0);
      }
    },
    15000
  );
});
