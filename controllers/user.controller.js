const userDB = require("../models/user.schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        const existingUser = await userDB.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) return res.status(400).json({ status: 0, message: 'Email or phone already in use' });

        const hash = await bcrypt.hash(password, 10);
        const newUser = await userDB.create({ isActive: true, name, email, password: hash, phone, role });

        res.status(201).json({ status: 1, message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;

        const user = await userDB.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
        if (!user) return res.status(400).json({ status: 0, message: "Invalid credentials" });
        if (!user.isActive) return res.status(401).json({ status: 0, message: "Account is deactivated" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ status: 0, message: 'Invalid credentials' });
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            status: 1,
            message: 'Login successful',
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                access_token: token
            }
        });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await userDB.find({role: "user"}).select("-password");;
        res.json({
            status: 1,
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    const user = await userDB.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 0, message: 'User not found' });
    res.status(500).json({ status: 1, message: user });
};

exports.updateUser = async (req, res) => {
    const { name, email, phone, role, isActive } = req.body;
    const user = await userDB.findByIdAndUpdate(req.params.id, { name, email, phone, role, isActive }, { new: true });
    if (!user) return res.status(404).json({ status: 0, message: 'User not found' });
    res.json({ status: 1, message: 'User updated', user });
};

exports.deleteUser = async (req, res) => {
    await userDB.findByIdAndDelete(req.params.id);
    res.json({ status: 1, message: 'User deleted' });
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id, isActive } = req.body;
        const user = await userDB.findByIdAndUpdate(
            id,
            { $set: { isActive } },
            { new: true }
        );

        if (!user) return res.status(404).json({ status: 0, message: 'User not found' });

        const status = isActive ? 'activated' : 'deactivated';
        res.json({ status: 1, message: `User ${status} successfully`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};