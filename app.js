var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var mongoose = require("mongoose");
var helmet = require("helmet");
const jwt = require("jsonwebtoken");
const { error } = require("./response");

var log = require("./logs");

const userModel = require("./models/user");

const router = require("./routes");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(cors({ origin: process.env.APP_HOME, credentials: true }));
app.use(helmet());

mongoose
  .connect(process.env.DBURL)
  .then(() => {
    log.info("mongodb connected successfully");
  })
  .catch((err) => {
    log.error("mongodb connection error: ", err);
  });

app.use(async (req, res, next) => {
  try {
    const { jwt: token } = req.cookies;
    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) return error(res, 404, 'User not found');

    log.info('user is:', user.email);
    req.user = user;
    next();
  } catch (e) {
    log.error(e);
    res.clearCookie("jwt");
    return error(res, 'Unauthorized', 401);
  }
});


app.use("/api", router);
app.use("*", (req, res) => res.redirect(process.env.APP_HOME));

module.exports = app;
