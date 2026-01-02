const { Router } = require("express");
const { signup, login, getUsers, updateUser, deleteUser, toggleUserStatus, getUserById } = require("../controllers/user.controller");
const protect = require("../middlewares/auth");

const userRouter = Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);

userRouter.get("/", protect, getUsers);
userRouter.get('/:id', protect, getUserById);
userRouter.put('/:id', protect, updateUser);
userRouter.delete('/:id', protect, deleteUser);
userRouter.patch('/status', protect, toggleUserStatus);

module.exports = userRouter;