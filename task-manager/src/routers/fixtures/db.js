const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../../models/user');
const Task = require('../../models/task');

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

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'First Task',
  completed: false,
  owner: userOne._id,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Second Task',
  completed: true,
  owner: userOne._id,
};

// Mock User Two
const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: 'Ralp',
  email: 'ralph@example.com',
  password: 'somesniff2',
  tokens: [
    {
      // Having this token, we're mocking that the user is already logged in
      token: jwt.sign({ _id: userTwoId }, jwtSecret),
    },
  ],
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Third Task',
  completed: true,
  owner: userTwo._id,
};

const setupDatabase = async () => {
  // This way we're always starting with an empty database
  await User.deleteMany();
  await Task.deleteMany();

  await new User(userOne).save();
  await new User(userTwo).save();

  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

const users = {
  userOne,
  userTwo,
};

const tasks = {
  taskOne,
  taskTwo,
  taskThree,
};

module.exports = {
  users,
  tasks,
  setupDatabase,
};
