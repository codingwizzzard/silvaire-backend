const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        unique: true
    },
    color: String,
    size: String,
    price: {
        type: Number,
        required: true
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    images: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { _id: true });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {type: String},
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        required: true
    },
    variants: {
        type: [variantSchema],
        required: true
    },
    cover_images: {
        type: [String],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const productDB = mongoose.model("products", productSchema);

module.exports = productDB;