const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "نام محصول الزامی است"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "قیمت محصول الزامی است"],
      min: 0,
    },

    count: {
      type: Number,
      default: 0,
      min: 0,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "دسته‌بندی محصول الزامی است"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "deactive"],
      default: "active",
    },

    images: [
      {
        type: String,
      },
    ],

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    weight: {
      type: String,
      trim: true,
      default: "",
    },
    categoryName: {
      type: String,
      trim: true,
      default: "",
    },

    productlabel: {
      type: String,
      trim: true,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// // قیمت بعد از تخفیف
// productSchema.virtual("finalPrice").get(function () {
//   return this.price - (this.price * this.discount) / 100;
// });

module.exports = mongoose.model("Product", productSchema);
