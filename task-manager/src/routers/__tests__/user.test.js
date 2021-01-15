const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = require('../../app');
const { jwtSecret } = require('../../config');
const User = require('../../models/user');

const emailsService = require('../../services/emails');
// Mocked emails service functions in services/__mocks__
jest.mock('../../services/emails');

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

beforeEach(async () => {
  // This way we're always starting with an empty database
  await User.deleteMany();

  // We're adding this userOne because some routes require that at least
  // one user exists in order to log in, return user info, etc...
  await new User(userOne).save();

  // Clearing Mocks usage data to be ready for every new test
  emailsService.sendWelcomeEmail.mockClear();
  emailsService.sendCancelEmail.mockClear();
});

test('Should signup a new user', async () => {
  const userCredentials = {
    name: 'Omar',
    email: 'omar@example.com',
  };

  const mockUser = {
    ...userCredentials,
    password: 'MyPass777!',
  };

  const response = await request(app)
    .post('/users')
    .set('Accept', 'application/json')
    .send(mockUser)
    // We can use regex's like in here
    .expect('Content-Type', /json/)
    .expect(201);

  // Verifying our sendWelcomeEmail function was called once
  expect(emailsService.sendWelcomeEmail).toHaveBeenCalledWith(
    mockUser.email,
    mockUser.name
  );

  const createdUser = response.body.user;

  // Making sure the user was created in the database
  const user = await User.findById(createdUser._id);
  expect(user).toMatchObject(userCredentials);

  // Ensuring that the password is not stored in plain text
  expect(user.password).not.toBe(mockUser.password);

  // Making sure the user contains non-sensitive data
  expect(response.body).toMatchObject({
    user: userCredentials,
    token: user.tokens[0].token,
  });

  // Making sure the user doesn't contains the password
  expect(createdUser).not.toHaveProperty('password');
});

test('Should login existing user successfully', async () => {
  const response = await request(app)
    .post('/users/login')
    .set('Accept', 'application/json')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect('Content-Type', /json/)
    .expect(200);

  const user = await User.findById(userOne._id);

  expect(response.body).toMatchObject({
    user: {
      name: userOne.name,
      email: userOne.email,
    },
    token: user.tokens[0].token,
  });

  expect(response.body.user).not.toHaveProperty('password');
});

test('Should not login nonexisting user', async () => {
  const nonExistingUser = {
    email: 'John Doe',
    password: 'madepass33',
  };

  await request(app)
    .post('/users/login')
    .set('Accept', 'application/json')
    .send(nonExistingUser)
    .expect(400);
});

test('Should get profile for user', async () => {
  const { token } = userOne.tokens[0];

  const response = await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body).toMatchObject({
    _id: userOneId.toString(),
    name: userOne.name,
    email: userOne.email,
  });
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
  const { token } = userOne.tokens[0];

  const response = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect('Content-Type', /json/)
    .expect(200);

  // Making sure the sendCancelEmail function was called once
  expect(emailsService.sendCancelEmail).toHaveBeenCalledWith(
    userOne.email,
    userOne.name
  );

  const deletedUser = response.body;

  expect(deletedUser).toMatchObject({
    _id: userOneId.toString(),
    name: userOne.name,
    email: userOne.email,
  });

  // Making sure the user was deleted from database
  const user = await User.findById(deletedUser._id);
  expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
  await request(app).delete('/users/me').send().expect(401);

  // Making sure sendCancelEmail wasn't called
  expect(emailsService.sendCancelEmail.mock.calls.length).toBe(0);
});
