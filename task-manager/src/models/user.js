const mongoose = require('mongoose');
const validator = require('validator');

// Our schema for the User Model, using data validation and sanitization
const schema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('You must provide a valid email');
            }
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [
            6,
            'Your password is weak, it must be at least 6 characters long.',
        ],
        validate(value) {
            if (value.includes('password')) {
                throw new Error(
                    `Password insecure, the word 'password' shouldn't be stored as a password.`
                );
            }
        },
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number');
            }
        },
    },
});

const User = mongoose.model('User', schema);

module.exports = User;
