const productDB = require("../models/product.schema");

exports.createProduct = async (req, res) => {
    try {
        const { name, slug, description, categoryId } = req.body;

        if (!name || !slug || !categoryId) {
            return res.status(400).json({
                status: 0,
                message: "Name, slug and category are required"
            });
        }

        const existing = await productDB.findOne({ slug: slug.toLowerCase() });
        if (existing) {
            return res.status(409).json({
                status: 0,
                message: "Product slug already exists"
            });
        }

        let variants = req.body.variants || [];
        if (typeof variants === "string") {
            variants = JSON.parse(variants);
        }

        let cover_images = [];

        if (req.body.cover_images) {
            cover_images = Array.isArray(req.body.cover_images)
                ? req.body.cover_images
                : JSON.parse(req.body.cover_images);
        }

        if (req.files && req.files.length) {
            const uploadedCovers = req.files
                .filter(f => f.fieldname === "cover_images")
                .map(f => f.filename);

            if (uploadedCovers.length > 0) {
                cover_images = uploadedCovers;
            }
        }

        if (!Array.isArray(cover_images) || cover_images.length < 1 || cover_images.length > 2) {
            return res.status(400).json({
                status: 0,
                message: "Cover images must be minimum 1 and maximum 2"
            });
        }

        if (req.files && req.files.length) {
            variants = variants.map((variant, index) => {
                const images = req.files
                    .filter(file => file.fieldname === `variantImages_${index}`)
                    .map(file => file.filename);

                return { ...variant, images };
            });
        }

        const product = await productDB.create({
            name,
            slug,
            description,
            categoryId,
            cover_images,
            variants,
            isActive: true
        });

        return res.status(201).json({
            status: 1,
            message: "Product created successfully",
            data: product
        });

    } catch (error) {
        return res.status(500).json({ status: 0, message: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await productDB.find().populate("categoryId", "name slug").sort({ createdAt: -1 });
        res.status(200).json({ status: 1, data: products });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await productDB.findById(req.params.id).populate("categoryId", "name slug");
        if (!product) {
            return res.status(404).json({ status: 0, message: "Product not found" });
        }
        res.status(200).json({ status: 1, data: product });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ status: 0, message: "Invalid product id" });
        }

        const { name, slug, description, categoryId } = req.body;

        let variants = req.body.variants || [];
        if (typeof variants === "string") {
            variants = JSON.parse(variants);
        }

        let cover_images = [];

        if (req.body.cover_images) {
            cover_images = Array.isArray(req.body.cover_images)
                ? req.body.cover_images
                : JSON.parse(req.body.cover_images);
        }

        if (req.files && req.files.length) {
            const uploadedCovers = req.files
                .filter(f => f.fieldname === "cover_images")
                .map(f => f.filename);

            if (uploadedCovers.length) {
                cover_images = uploadedCovers;
            }
        }

        if (cover_images.length < 1 || cover_images.length > 2) {
            return res.status(400).json({
                status: 0,
                message: "Cover images must be minimum 1 and maximum 2"
            });
        }

        if (req.files && req.files.length) {
            variants = variants.map((variant, index) => {
                const images = req.files
                    .filter(file => file.fieldname === `variantImages_${index}`)
                    .map(file => file.filename);

                return {
                    ...variant,
                    images: images.length ? images : variant.images || []
                };
            });
        }

        const product = await productDB.findByIdAndUpdate(
            req.params.id,
            { name, slug, description, categoryId, variants },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ status: 0, message: "Product not found" });
        }

        res.status(200).json({ status: 1, message: "Product updated successfully", data: product });

    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ status: 0, message: "Invalid product id" });
        }

        const product = await productDB.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ status: 0, message: "Product not found" });
        }

        product.cover_images.forEach(image => {
            const imgPath = path.join(process.cwd(), "uploads", image);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        });

        product.variants.forEach(variant => {
            variant.images?.forEach(image => {
                const imagePath = path.join(
                    process.cwd(),
                    "uploads",
                    image
                );
                if (fs.existsSync(imagePath)) { fs.unlinkSync(imagePath); }
            });
        });

        await productDB.findByIdAndDelete(req.params.id);

        res.status(200).json({ status: 1, message: "Product deleted successfully" });

    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

exports.toggleProductStatus = async (req, res) => {
    try {
        const { id, isActive } = req.body;
        const product = await productDB.findByIdAndUpdate(id, { $set: { isActive } }, { new: true });

        if (!product) return res.status(404).json({ status: 0, message: 'Product not found' });

        const status = isActive ? 'activated' : 'deactivated';
        res.json({ status: 1, message: `Product ${status} successfully`, product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};