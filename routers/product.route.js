const { Router } = require("express");
const { createProduct, getAllProducts, toggleProductStatus, updateProduct, deleteProduct, getProductById } = require("../controllers/product.controller");
const protect = require("../middlewares/auth");
const upload = require("../middlewares/product_multer.js");

const productRouter = Router();

productRouter.post("/", upload.any(), createProduct);
productRouter.get("/", getAllProducts);
productRouter.patch('/status', protect, toggleProductStatus);
productRouter.patch("/:id", upload.any(), updateProduct);
productRouter.delete("/:id", deleteProduct);
productRouter.get("/:id", getProductById);

module.exports = productRouter;