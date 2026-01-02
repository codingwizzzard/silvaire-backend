const { Router } = require("express");
const upload = require("../middlewares/multer");
const { addCategory, fetchAllCategories, updateCategory, deleteCategory, toggleStatus, fetchCategoryById } = require("../controllers/category.controller");
const protect = require("../middlewares/auth");

const categoryRouter = Router();

categoryRouter.post("/", upload, addCategory);
categoryRouter.get("/", fetchAllCategories);
categoryRouter.patch('/status', protect, toggleStatus);
categoryRouter.patch("/:id", upload, updateCategory);
categoryRouter.delete("/:id", deleteCategory);
categoryRouter.get("/:id", fetchCategoryById);

module.exports = categoryRouter;