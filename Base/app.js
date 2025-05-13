var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var cors = require("cors");
var createError = require("http-errors");

var app = express();

function configureApp(app) {
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "jade");
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static("../storage"));
  app.use(cors());
}

function errorApp(app) {
  app.use((req, res, next) => {
    res.status(404).json({ success: false, message: "Not Found" });
  });
}
module.exports = errorApp;



configureApp(app);
var VLTGRouter = require("./routes/vieclamtheogio");
app.use("/api/vltg", VLTGRouter);
errorApp(app);

// ✨ Export app
module.exports = app;
