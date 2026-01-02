const categoryDB = require("../models/cateegory.schema");
const path = require("path");
const fs = require("fs");

exports.addCategory = async (req, res) => {
    try {
        const { name, slug, description } = req.body;
        const image = req.file ? req.file.filename : "";

        if (!name || !slug) {
            return res.status(400).json({
                status: 0,
                message: "Name and slug are required"
            });
        }

        const existing = await categoryDB.findOne({ slug: slug.toLowerCase() });

        if (existing) {
            return res.status(409).json({
                status: 0,
                message: "Slug already exists"
            });
        }

        const addCategory = await categoryDB.create({
            name,
            slug,
            description,
            image,
            isActive: true,
        });

        return res.status(201).json({
            status: 1,
            message: "Category created successfully",
            data: addCategory
        });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, slug, description, isActive } = req.body;
        const image = req.file ? req.file.filename : undefined;
        
        const updatedCategory = await categoryDB.findByIdAndUpdate(
            req.params.id,
            {
                name,
                slug,
                description,
                isActive,
                ...(image && { image })
            },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ status: 0, message: 'Category not found' });
        }
        return res.status(200).json({
            status: 1,
            message: "Category updated successfully",
            data: updatedCategory
        });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await categoryDB.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ status: 0, message: "Category not found" });
        }

        if (category.image) {
            const imagePath = path.join(__dirname, "..", "uploads", category.image);

            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.log("Image delete error:", err.message);
                }
            });
        }

        await categoryDB.findByIdAndDelete(req.params.id);

        res.status(200).json({
            status: 1,
            message: "Category deleted successfully",
        });

    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

exports.fetchAllCategories = async (req, res) => {
    try {
        const categories = await categoryDB.find().sort({ createdAt: -1 });
        res.json({ status: 1, message: "Categories fetched successfully", data: categories });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

exports.fetchCategoryById = async (req, res) => {
    try {
        const category = await categoryDB.findById(req.params.id);
        if (!category)
            return res.status(404).json({ status: 0, message: "Category not found" });

        res.json({ status: 1, message: "Category fetched successfully", data: category });
    } catch (error) {
        res.status(500).json({ status: 0, message: "Server error", error: error.message });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const { id, isActive } = req.body;
        const category = await categoryDB.findByIdAndUpdate(
            id,
            { $set: { isActive } },
            { new: true }
        );
        if (!category) return res.status(404).json({ status: 0, message: 'Category not found' });
    
        const status = isActive ? 'activated' : 'deactivated';
        res.json({ status: 1, message: `Category ${status} successfully`, category });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};