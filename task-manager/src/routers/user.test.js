const request = require('supertest');
const app = require('../app');

const User = require('../models/user');

const userOne = {
  name: 'Mike',
  email: 'mike@example.com',
  password: '56what!!',
};

beforeEach(async () => {
  // This way we're always starting with an empty database
  await User.deleteMany();

  // We're adding this userOne because some routes require that at least
  // one user exists in order to log in, return user info, etc...
  await new User(userOne).save();
});

test('Should signup a new user', async () => {
  const mockUser = {
    name: 'Omar',
    email: 'omar@example.com',
    password: 'MyPass777!',
  };

  const response = await request(app)
    .post('/users')
    .send(mockUser)
    .set('Accept', 'application/json')
    // We can use regex's like in here
    .expect('Content-Type', /json/)
    .expect(201);

  // Making sure the user contains non-sensitive data
  expect(response.body).toMatchObject({
    user: {
      name: mockUser.name,
      email: mockUser.email,
    },
    token: expect.any(String),
  });

  // Making sure the user doesn't contains the password
  expect(response.body.user).not.toHaveProperty('password');
});

test('Should login existing user successfully', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body).toMatchObject({
    user: {
      name: userOne.name,
      email: userOne.email,
    },
    token: expect.any(String),
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
    .send(nonExistingUser)
    .set('Accept', 'application/json')
    .expect(400);
});
