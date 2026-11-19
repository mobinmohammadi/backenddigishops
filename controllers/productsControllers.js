const formidable = require("formidable");
const { responseReturn } = require("../utils/responseReturn");
const cloudinary = require("cloudinary").v2;
const productsModel = require("../model/productsModel");

class productControllers {
  add_product = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return responseReturn(res, 400, {
          message: "خطا در دریافت اطلاعات فرم",
        });
      }

      try {
        const { tags } = fields;
        const getField = (value) => (Array.isArray(value) ? value[0] : value);

        const name = String(getField(fields.name) || "").trim();
        const price = Number(getField(fields.price));
        const count = Number(getField(fields.count) || 0);
        const categoryId = getField(fields.categoryId);
        const description = String(getField(fields.description) || "").trim();
        const status = getField(fields.status) || "active";
        const brand = String(getField(fields.brand) || "").trim();
        const discount = Number(getField(fields.discount) || 0);
        const weight = getField(fields.weight);
        const productlabel = getField(fields.productlabel);
        const categoryName = getField(fields.categoryName);
        console.log("categoryName", categoryName);

        if (!name || !categoryId || !Number.isFinite(price)) {
          return responseReturn(res, 400, {
            error: "اطلاعات ضروری محصول ناقص است",
          });
        }

        const images = files.images
          ? Array.isArray(files.images)
            ? files.images
            : [files.images]
          : [];

        if (!images.length) {
          return responseReturn(res, 400, {
            error: "لطفاً حداقل یک تصویر انتخاب کنید",
          });
        }

        const allImageUrl = [];
        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
        });
        for (const image of images) {
          console.log("File path:", image.filepath);

          const result = await cloudinary.uploader.upload(image.filepath, {
            folder: "productsDigi",
            upload_preset: "ml_default", // 👈 این خط را اضافه کنید
          });

          console.log("result ==> ", result);

          console.log("Cloudinary upload success:", result.secure_url);

          allImageUrl.push(result.secure_url);
        }
        const slug = name.split(/\s+/).join("-");

        const product = await productsModel.create({
          name,
          slug,
          count,
          categoryName,
          categoryId,
          status,
          weight,
          productlabel,
          brand,
          images: allImageUrl,
          price,
          discount,
          tags,
          description,
        });

        return responseReturn(res, 201, {
          product,
          message: "محصول با موفقیت ساخته شد",
        });
      } catch (error) {
        console.error("PRODUCT ERROR:", error);

        // console.error("Cloudinary details:", {
        //   message: error.message,
        //   http_code: error.http_code,
        //   name: error.name,
        //   error: error.error,
        //   stack: error.stack,
        // });

        return responseReturn(res, 500, {
          error: error.message,
          message: "خطا در ساخت محصول",
        });
      }
    });
  };

  get_all_products = async (req, res) => {
    try {
      const allProducts = await productsModel.find({}).sort({ createdAt: 1 });
      const totalProducts = await productsModel.find({}).countDocuments();
      responseReturn(res, 200, { allProducts, totalProducts });
    } catch (error) {
      console.log(error);
    }
  };

  delete_product = async (req, res) => {
    const { productId } = req.body;

    // console.log(req.body);

    try {
      await productsModel.findByIdAndDelete(productId);
      console.log(productId);

      responseReturn(res, 201, { message: "محصول با موفقیت حذف شد" });
    } catch (error) {
      responseReturn(res, 500, { error: "خطا در حذف محصول" });
    }
  };

  get_active_product = async (req, res) => {
    try {
      const totaleActiveProduct = await productsModel
        .find({
          status: "active",
        })
        .countDocuments();
      responseReturn(res, 200, { totaleActiveProduct });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, {
        message: "حطا در بر قراری ارتباط زیر محصولات ها",
      });
    }
  };
  get_deactive_product = async (req, res) => {
    try {
      const totaleDeactiveProduct = await productsModel
        .find({
          status: "deactive",
        })
        .countDocuments();
      responseReturn(res, 200, { totaleDeactiveProduct });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, {
        message: "حطا در بر قراری ارتباط زیر محصولات ها",
      });
    }
  };

  not_count_product = async (req, res) => {
    try {
      const notCountProduct = await productsModel
        .find({
          count: 0,
        })
        .countDocuments();
      responseReturn(res, 200, { notCountProduct });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, {
        message: "حطا در بر قراری ارتباط زیر محصولات ها",
      });
    }
  };

  total_stock = async (req, res) => {
    try {
      const result = await productsModel.aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: "$count" },
          },
        },
      ]);

      const total_stock = result[0]?.totalStock ?? 0;
      responseReturn(res, 200, { total_stock });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, {
        message: "خطا در برقراری ارتباط با محصولات",
      });
    }
  };
}

module.exports = new productControllers();
