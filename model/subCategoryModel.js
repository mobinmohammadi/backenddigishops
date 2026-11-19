const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "deactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SubCategory", subCategorySchema);
