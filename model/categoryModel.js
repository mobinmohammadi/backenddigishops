const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["active", "deactive"],
    default: "active"
  }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);