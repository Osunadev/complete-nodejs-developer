const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../../models/user');

const { jwtSecret } = require('../../config');

// Mock User One
const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'Mike',
  email: 'mike@example.com',
  password: '56what!!',
  tokens: [
    {
      // Having this token, we're mocking that the user is already logged in
      token: jwt.sign({ _id: userOneId }, jwtSecret),
    },
  ],
};

const setupDatabase = async () => {
  // This way we're always starting with an empty database
  await User.deleteMany();

  // We're adding this userOne because some routes require that at least
  // one user exists in order to log in, return user info, etc...
  await new User(userOne).save();
};

module.exports = {
  userOne,
  setupDatabase,
};
