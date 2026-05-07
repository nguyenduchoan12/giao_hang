const express = require("express");
const { sequelize } = require("./models");
const { rootRouter } = require("./routers");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const port = 3005;
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

app.use(cookieParser());
app.use(cors());
//cài ứng dụng sử dụng json
app.use(express.json());
//cài static file
app.use(express.static(path.join(__dirname)));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());

const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

//dùng router
app.use(rootRouter);
//lắng nghe sự kiện kết nối
app.listen(port, async () => {
  console.log(`App listening on http://localhost:${port}`);
  try {
    await sequelize.authenticate();
    console.log("Kết nối thành công!.");
  } catch (error) {
    console.error("Kết nối thất bại:", error);
  }
});
