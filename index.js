const express = require("express");
const path = require("path");
const cors = require("cors");
const db = require("./config/database");
const userRouter = require("./routers/user.route");
const categoryRouter = require("./routers/category.route");
const productRouter = require("./routers/product.route");

const PORT = process.env.PORT

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());

app.use(async (req, res, next) => {
  await db();
  next();
});

app.use('/api/users', userRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);

// app.listen(PORT, () => {
//     db();
//     console.log("Server is running on port 5000");
// });