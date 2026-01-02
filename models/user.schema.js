const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number (10–15 digits)']
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const userDB = mongoose.model('userTbl', userSchema);

module.exports = userDB;