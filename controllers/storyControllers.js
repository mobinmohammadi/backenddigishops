const formidable = require("formidable");
const cloudinary = require("cloudinary").v2;
const storyModel = require("../model/storyModel");
const { responseReturn } = require("../utils/responseReturn");

// ------------------------------------------------------------
// پیکربندی Cloudinary (یک‌بار در بالای فایل)
// ------------------------------------------------------------
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

// ------------------------------------------------------------
// آپلود یک فایل (از مسیر دیسک) به Cloudinary
// resourceType: "image" | "video"
// ------------------------------------------------------------
const uploadToCloudinary = async (filePath, resourceType = "image") => {
  // برای ویدیو، حتماً resource_type را "video" قرار دهید
  // برای تصویر، "image" (پیش‌فرض) کافی است
  const options = {
    folder: "storiesDigi",
    resource_type: resourceType, // 👈 این خط حیاتی است
  };

  // اگر واقعاً به preset نیاز دارید، فقط برای unsigned uploads استفاده کنید
  // چون شما از API Key و Secret استفاده می‌کنید، آپلود signed است و نیازی به preset نیست
  // options.upload_preset = "ml_default"; // 👈 این خط را حذف کنید

  const result = await cloudinary.uploader.upload(filePath, options);
  return result;
};

class storyControllers {
  // ==========================================================
  // افزودن استوری
  // ==========================================================
  add_story = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      // formidable فیلدها را گاهی به‌صورت آرایه برمی‌گرداند؛ نرمال‌سازی می‌کنیم
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const href = Array.isArray(fields.href) ? fields.href[0] : fields.href;
      console.log(fields);

      const contentType = Array.isArray(fields.contentType)
        ? fields.contentType[0]
        : fields.contentType;
      const status = Array.isArray(fields.status)
        ? fields.status[0]
        : fields.status;

      if (err) {
        responseReturn(res, 400, {
          error: "خطا در دریافت اطلاعات استوری",
        });
      }

      try {
        // ---------- اعتبارسنجی فیلدهای متنی ----------
        if (!name) {
          responseReturn(res, 400, {
            error: "نام استوری الزامی است",
          });
        }

        if (!["image", "video"].includes(contentType)) {
          return responseReturn(res, 400, {
            error: "نوع محتوا باید image یا video باشد",
          });
        }

        // ---------- گرفتن فایل‌ها ----------
        // formidable ممکن است فایل را تک یا آرایه بدهد
        const posterFile = files.poster
          ? Array.isArray(files.poster)
            ? files.poster[0]
            : files.poster
          : null;

        const contentFile = files.content
          ? Array.isArray(files.content)
            ? files.content[0]
            : files.content
          : null;

        if (!posterFile) {
          return responseReturn(res, 400, {
            error: "پوستر استوری الزامی است",
          });
        }

        if (!contentFile) {
          responseReturn(res, 400, {
            error: "محتوای استوری الزامی است",
          });
        }

        // ---------- آپلود پوستر (همیشه image) ----------
        const posterResult = await uploadToCloudinary(
          posterFile.filepath,
          "image",
        );

        // ---------- آپلود محتوا بر اساس نوع ----------
        const contentResult = await uploadToCloudinary(
          contentFile.filepath,
          contentType === "video" ? "video" : "image",
        );

        // ---------- ذخیره در دیتابیس ----------
        const story = await storyModel.create({
          name,
          href,
          contentType,
          status: status || "active",
          poster: {
            url: posterResult.secure_url,
            public_id: posterResult.public_id,
          },
          content: {
            url: contentResult.secure_url,
            public_id: contentResult.public_id,
          },
        });

        return responseReturn(res, 201, {
          story,
          message: "استوری با موفقیت ساخته شد",
        });
      } catch (error) {
        console.error("STORY ERROR:", error);
        responseReturn(res, 500, {
          error: error,
        });
      }
    });
  };

  // ==========================================================
  // دریافت همه استوری‌ها (اختیاری)
  // ==========================================================
  get_stories = async (req, res) => {
    try {
      const stories = await storyModel
        .find({})
        .sort({ order: 1, createdAt: -1 });

      return responseReturn(res, 200, { stories });
    } catch (error) {
      return responseReturn(res, 500, {
        error: error.message,
        message: "خطا در دریافت استوری‌ها",
      });
    }
  };

  // ==========================================================
  // حذف استوری + پاک کردن فایل‌ها از Cloudinary
  // ==========================================================
  delete_story = async (req, res) => {
    const { storyId } = req.params;

    try {
      const story = await storyModel.findById(storyId);

      if (!story) {
        return responseReturn(res, 404, { message: "استوری پیدا نشد" });
      }

      // پاک کردن پوستر (image)
      if (story.poster?.public_id) {
        await cloudinary.uploader.destroy(story.poster.public_id);
      }

      // پاک کردن محتوا (بسته به نوع)
      if (story.content?.public_id) {
        await cloudinary.uploader.destroy(story.content.public_id, {
          resource_type: story.contentType === "video" ? "video" : "image",
        });
      }

      await storyModel.findByIdAndDelete(storyId);

      return responseReturn(res, 200, {
        message: "استوری با موفقیت حذف شد",
      });
    } catch (error) {
      return responseReturn(res, 500, {
        error: error.message,
        message: "خطا در حذف استوری",
      });
    }
  };
}

module.exports = new storyControllers();
