const categoryModel = require("../model/categoryModel");
const subCategoryModel = require("../model/subCategoryModel");
const { responseReturn } = require("../utils/responseReturn");

const cloudinary = require("cloudinary").v2;

class categoryControllers {
  add_category = async (req, res) => {
    console.log(req.body);

    try {
      const { name, slug, status } = req.body;

      if (!name || !slug) {
        responseReturn(res, 404, {
          error: "پر کردن هر کدام از فیلد ها الزامی است !",
        });
      } else {
        const category = await categoryModel.create({
          name,
          slug,
          status,
        });
        responseReturn(res, 201, {
          category,
          message: "دسته بندی با موفقیت ایجاد شد",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  add_sub_category = async (req, res) => {
    console.log(req.body);

    try {
      const { parentId, name, slug } = req.body;

      if (!name || !slug || !parentId) {
        responseReturn(res, 404, {
          error: "پر کردن هر کدام از فیلد ها الزامی است !",
        });
      }
      const exist = await categoryModel.findOne({ slug });
      const subExist = await subCategoryModel.findOne({ slug });
      if (exist || subExist) {
        responseReturn(res, 404, {
          error: "این slug قبلا ثبت شده است لطفا یکی دیگر بنویسید",
        });
      } else {
        const subCategory = await subCategoryModel.create({
          name,
          slug,
          parentId,
        });
        responseReturn(res, 201, {
          subCategory,
          message: "زیر دسته بندی با موفقیت ایجاد شد ",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_all_category = async (req, res) => {
    try {
      const allCategory = await categoryModel.find({});
      responseReturn(res, 200, { allCategory });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, {
        message: "حطا در بر قراری ارتباط زیر دسته بندی ها",
      });
    }
  };
  get_sub_category = async (req, res) => {
    try {
      const subCategory = await subCategoryModel.find({});
      responseReturn(res, 200, { subCategory });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, {
        message: "حطا در بر قراری ارتباط زیر دسته بندی ها",
      });
    }
  };

  get_active_category = async (req, res) => {
    try {
      const activeCategory = await categoryModel.find({
        status: "active",
      });
      responseReturn(res, 200, { activeCategory });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, {
        message: "حطا در بر قراری ارتباط زیر دسته بندی ها",
      });
    }
  };
  get_deactive_category = async (req, res) => {
    try {
      const deactiveCategory = await categoryModel.find({
        status: "deactive",
      });
      responseReturn(res, 200, { deactiveCategory });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, {
        message: "حطا در بر قراری ارتباط زیر دسته بندی ها",
      });
    }
  };
}

module.exports = new categoryControllers();
