const userModel = require("../model/userModel");
const { responseReturn } = require("../utils/responseReturn");
const bcrypt = require("bcrypt");
const { createToken } = require("../utils/tokeCreate");
const adminModel = require("../model/adminModel");
const RoleModel = require("../model/RoleModel");

class authController {
  admin_Register = async (req, res) => {
    const { fullName, email, password, phone } = req.body;

    try {
      // بررسی اطلاعات ورودی
      if (!fullName || !email || !password) {
        return responseReturn(res, 400, {
          success: false,
          error: "لطفاً نام، ایمیل و رمز عبور را وارد کنید",
        });
      }

      // نرمال‌سازی ایمیل
      const normalizedEmail = email.trim().toLowerCase();

      // بررسی وجود ایمیل در دیتابیس
      const existingAdmin = await adminModel.findOne({
        email: normalizedEmail,
      });

      if (existingAdmin) {
        return responseReturn(res, 409, {
          success: false,
          error: "این ایمیل قبلاً ثبت‌نام شده است",
        });
      }

      // هش کردن رمز عبور
      const hashedPassword = await bcrypt.hash(password, 10);

      // ایجاد ادمین جدید
      const admin = await adminModel.create({
        name: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || null,
        role: "admin",
        status: "active",
      });

      // ساخت JWT
      const token = await createToken({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      });

      console.log(token);

      // تنظیم کوکی
      res.cookie("adminToken", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // پاسخ موفقیت
      responseReturn(res, 201, {
        success: true,
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          status: admin.status,
        },
        token,
        message: "حساب ادمین با موفقیت ایجاد شد",
      });
    } catch (error) {
      console.log("Admin Register Error:", error);

      return responseReturn(res, 500, {
        success: false,
        error: "خطای داخلی سرور",
      });
    }
  };

  admin_Login = async (req, res) => {
    const { email, password } = req.body;

    try {
      // بررسی اطلاعات ورودی
      if (!email || !password) {
        return responseReturn(res, 400, {
          success: false,
          error: "لطفاً ایمیل و رمز عبور را وارد کنید",
        });
      }

      // نرمال‌سازی ایمیل
      const normalizedEmail = email.trim().toLowerCase();

      // پیدا کردن ادمین و دریافت پسورد
      const admin = await adminModel
        .findOne({
          email: normalizedEmail,
        })
        .select("+password");

      // بررسی وجود ادمین
      if (!admin) {
        return responseReturn(res, 404, {
          success: false,
          error: "ایمیل یا رمز عبور اشتباه است",
        });
      }

      // بررسی رمز عبور
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        responseReturn(res, 401, {
          success: false,
          error: "ایمیل یا رمز عبور اشتباه است",
        });
      }

      // بررسی وضعیت ادمین
      if (admin.status !== "active") {
        return responseReturn(res, 403, {
          success: false,
          error: "حساب کاربری شما غیرفعال یا مسدود شده است",
        });
      }

      // به‌روزرسانی آخرین زمان ورود
      admin.lastLogin = new Date();
      await admin.save();

      // ساخت JWT
      const token = await createToken({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      });

      // ذخیره توکن در Cookie
      res.cookie("adminToken", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        secure: false,
      });

      // پاسخ موفقیت
      responseReturn(res, 200, {
        success: true,
        token,
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          avatar: admin.avatar,
          role: admin.role,
          status: admin.status,
          lastLogin: admin.lastLogin,
        },
        message: "ورود با موفقیت انجام شد",
      });
    } catch (error) {
      console.log("Admin Login Error:", error);

      return responseReturn(res, 500, {
        success: false,
        error: "خطای داخلی سرور",
      });
    }
  };

  user_Register = async (req, res) => {
    const { email, fullName, password, phone } = req.body;

    try {
      const getuser = await userModel.findOne({ email });
      if (getuser)
        responseReturn(res, 404, {
          error: "این کاربر قبلا ثبت نام کرده است",
        });
      else {
        const user = await userModel.create({
          fullName,
          email,
          password: await bcrypt.hash(password, 10),
          phone: phone,
          method: "manualy",
        });

        const token = await createToken({
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          status: user.status,
        });
        res.cookie("customerToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        responseReturn(res, 201, {
          user,
          token,
          message: "کاربر گرامی خوش آمدید",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "خطای داخلی سرور" });
    }
  };

  user_login = async (req, res) => {
    const { email, password } = req.body;

    try {
      const foundUser = await userModel.findOne({ email }).select("+password");
      if (!foundUser)
        responseReturn(res, 404, { error: "کاربری با این ایمیل یافت نشد" });
      else {
        const match = await bcrypt.compare(password, foundUser.password);
        if (match) {
          console.log("foundUser ====", foundUser);

          const token = await createToken({
            email: foundUser.email,
            fullName: foundUser.fullName,
            status: foundUser.status,
            image: foundUser.image,
            phone: foundUser.phone,
          });
          res.cookie("customerToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          responseReturn(res, 200, {
            foundUser,
            token,
            message: "خوش آمدید سرورم",
          });
        } else {
          responseReturn(res, 401, { error: "رمز عبور نامعتبر" });
        }
      }
    } catch (error) {
      responseReturn(res, 404, { message: "کاربری با این ایمیل یافت نشد" });
    }
  };

  getUser = async (req, res) => {
    const { id, role } = req;
    console.log(id);
    console.log(role);

    try {
      if (role === "user") {
        const user = await userModel.findById(id);
        responseReturn(res, 200, { userInfo: user });
      }
    } catch (error) {
      responseReturn(res, 500, { erorr: "Internal Server Error 😣 " });
    }
  };
}

module.exports = new authController();
