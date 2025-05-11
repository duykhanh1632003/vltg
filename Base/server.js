const mongoose = require("mongoose");
const app = require("./app");

const DB_URL =
  "mongodb://vltg:123123@54.179.255.126:27067/vltg?authSource=admin";

mongoose
  .connect(DB_URL)
  .then(() => console.log("DB Connected!"))
  .catch((error) => console.log("DB connection error:", error.message));

// 🟢 Chạy server
const server = app.listen(3011, () => {
  console.log(`Viec lam theo gio app is running on port 3011`);
});

server.on("error", (error) => {
  console.error("Error occurred while listening:", error);
});
