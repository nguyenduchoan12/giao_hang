const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
    Account,
    Shipper,
    Customer,
    Transport_area
} = require("../models");


const createAccountForCustomer = async (req, res) => {
    const { username, password, name, email, phone, address } = req.body;
    try {
      //tạo ra một chuỗi ngẫu nhiên
      const salt = bcrypt.genSaltSync(10);
      //mã hoá salt + password
      const hashPassword = bcrypt.hashSync(password, salt);
      const newAccount = await Account.create({
        username,
        id_role: 1,
        password: hashPassword,
      });
      await Customer.create({
          id_account: newAccount.id_account,
          name,
          email,
          phone,
          address,
       });
        
      res.status(200).json({
        message: "Đăng ký thành công!",
      });
    }catch (error) {
      res.status(500).json({
        message: "Đăng ký thất bại!",
    });
    }
};
const createAccountForShipper = async (req, res) => {
    const { username, password, name, email, phone, address,area,route } = req.body;
    try {
      //tạo ra một chuỗi ngẫu nhiên
      const salt = bcrypt.genSaltSync(10);
      //mã hoá salt + password
      const hashPassword = bcrypt.hashSync(password, salt);
      const newAccount = await Account.create({
        username,
        id_role: 2,
        password: hashPassword,
      });
      await Shipper.create({
          id_account: newAccount.id_account,
          name,
          email,
          phone,
          address,
          description:""
      });
      const newArea = await Shipper.findOne({
        where:{
          id_account: newAccount.id_account,
        }
      });
      // console.log(newArea.id_shipper);
      await Transport_area.create({
          id_shipper: newArea.id_shipper,
          area,
          route,
      })
      console.log(newArea);
      res.status(200).json({
        message: "Đăng ký thành công!",
      });
    }catch (error) {
      res.status(500).json({
        message: "Đăng ký thất bại!",
    });
    }
};

const loginShipper = async (req, res) => {
    const { username, password } = req.body;
    const account = await Account.findOne({
      where: {
        username,
      },
    });
    if (account.id_role != 2) {
      res.status(400).json({ message: "Tài khoản không có quyền truy cập!" });
    } else {
      const shipper = await Shipper.findOne({
        where: {
          id_account: account.id_account,
        },
      });
      const isAuth = bcrypt.compareSync(password, account.password);
      if (isAuth) {
        const token = jwt.sign({ username: account.username }, "haulah", {
          expiresIn: 15 * 24 * 60 * 60,
        });
        const refreshToken = jwt.sign(
          { username: account.username },
          "haulah",
          {
            expiresIn: 30 * 24 * 60 * 60,
          }
        );
        res.status(200).json({
          message: "Đăng nhập thành công!",
          token,
          refreshToken,
          expireTimeToken: 15 * 24 * 60 * 60,
          expireTimeRefreshToken: 30 * 24 * 60 * 60,
          shipperInfo: shipper,
        });
      } else {
        res.status(400).json({ message: "Sai thông tin đăng nhập!" });
      }
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const account = await Account.findOne({
      where: {
        username,
      },
    });
    const isAuth = bcrypt.compareSync(password, account.password);
    if (isAuth) {
      const customer = await Customer.findOne({
        where: {
          id_account: account.id_account,
        },
      });
      const token = jwt.sign({ username: account.username }, "haulah", {
        expiresIn: 15 * 24 * 60 * 60,
      });
      const refreshToken = jwt.sign(
        { username: account.username },
        "haulah",
        {
          expiresIn: 30 * 24 * 60 * 60,
        }
      );
      res.status(200).json({
        message: "Đăng nhập thành công!",
        token,
        refreshToken,
        userInfo: customer,
        expireTimeToken: 15 * 60 * 60 * 24,
        expireTimeRefreshToken: 30 * 60 * 60 * 24,
        id_role: account.id_role,
      });
    } else {
      res.status(400).json({ message: "Sai thông tin đăng nhập!" });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword, repeatPassword } = req.body;
    try {
      const accountUpdate = await Account.findOne({
        where: {
          username: req.username,
        },
      });
      const isAuth = bcrypt.compareSync(oldPassword, accountUpdate.password);
      if (isAuth) {
        if (newPassword == repeatPassword) {
          if (newPassword == oldPassword) {
            res.status(400).send({
              message: "Mật khẩu mới không được giống với mật khẩu cũ!",
            });
          } else {
            //tạo ra một chuỗi ngẫu nhiên
            const salt = bcrypt.genSaltSync(10);
            //mã hoá salt + password
            const hashPassword = bcrypt.hashSync(newPassword, salt);
            accountUpdate.password = hashPassword;
            await accountUpdate.save();
            res.status(200).json({
              message: "Đổi mật khẩu thành công!",
            });
          }
        } else {
          res.status(400).json({
            message: "Mật khẩu lặp lại không đúng!",
          });
        }
      } else {
        res.status(400).json({
          message: "Mật khẩu không chính xác!",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Thao tác thất bại!",
      });
    }
};
  






module.exports = {
    createAccountForCustomer,
    createAccountForShipper,
    loginShipper,
    loginUser,
    changePassword
  };