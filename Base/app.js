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
  app.use(function (req, res, next) {
    next(createError(404));
  });

  app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
  });
}

configureApp(app);
var VLTGRouter = require("./routes/vieclamtheogio");
app.use("/api/vltg", VLTGRouter);
errorApp(app);

// ✨ Export app
module.exports = app;
