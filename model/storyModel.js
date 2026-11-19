const mongoose = require("mongoose");

// ------------------------------------------------------------
// زیراسکیمای فایل: هر فایل آپلودشده در Cloudinary دو مقدار دارد
//   - url: آدرس نهایی فایل
//   - public_id: شناسه فایل در Cloudinary (برای حذف/ویرایش بعدی)
// _id: false چون به شناسه جداگانه نیاز نداریم
// ------------------------------------------------------------
const fileSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    public_id: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const storySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "نام استوری الزامی است"],
      trim: true,
      minlength: [2, "نام باید حداقل ۲ کاراکتر باشد"],
      maxlength: [120, "نام نمی‌تواند بیشتر از ۱۲۰ کاراکتر باشد"],
    },

    href: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (v) => v === "" || /^(\/|https?:\/\/).+/.test(v),
        message: "لینک باید با / یا http(s):// شروع شود",
      },
    },

    contentType: {
      type: String,
      enum: {
        values: ["image", "video"],
        message: "نوع محتوا باید image یا video باشد",
      },
      required: true,
      default: "image",
    },

    // پوستر استوری (همیشه عکس)
    poster: {
      type: fileSchema,
      required: [true, "پوستر استوری الزامی است"],
    },

    // محتوای استوری (عکس یا فیلم بر اساس contentType)
    content: {
      type: fileSchema,
      required: [true, "محتوای استوری الزامی است"],
    },

    status: {
      type: String,
      enum: {
        values: ["active", "draft", "deactive"],
        message: "وضعیت نامعتبر است",
      },
      default: "active",
      index: true,
    },

    duration: {
      type: Number,
      default: 5000,
      min: [1000, "مدت زمان حداقل ۱ ثانیه است"],
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

storySchema.index({ status: 1, order: 1, createdAt: -1 });

module.exports = mongoose.model("Story", storySchema);