const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const categoryDB = mongoose.model('categories', categorySchema);

module.exports = categoryDB;