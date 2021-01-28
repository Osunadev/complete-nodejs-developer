const request = require('supertest');
const path = require('path');

const app = require('../../app');
const User = require('../../models/user');

const emailsService = require('../../services/emails');
const { userOne, setupDatabase } = require('../fixtures/db');

// Mocked emails service functions in services/__mocks__
jest.mock('../../services/emails');

beforeEach(async () => {
  await setupDatabase();
  // Clearing Mocks usage data to be ready for every new test
  emailsService.sendWelcomeEmail.mockClear();
  emailsService.sendCancelEmail.mockClear();
});

test('Should signup a new user', async () => {
  const userInfo = {
    name: 'Omar',
    email: 'omar@example.com',
  };

  const mockUser = {
    ...userInfo,
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
  expect(user).toMatchObject(userInfo);

  // Ensuring that the password is not stored in plain text
  expect(user.password).not.toBe(mockUser.password);

  // Making sure the user contains non-sensitive data
  expect(response.body).toMatchObject({
    user: userInfo,
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
  const lastToken = user.tokens[1].token;

  expect(response.body).toMatchObject({
    user: {
      name: userOne.name,
      email: userOne.email,
    },
    token: lastToken,
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
    _id: userOne._id.toString(),
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
    _id: userOne._id.toString(),
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

test('Should upload avatar image', async () => {
  const { token } = userOne.tokens[0];
  const avatarFile = path.join(__dirname, '../fixtures/profile-pic.jpg');

  await request(app)
    .post('/users/me/avatar')
    .set('Content-Type', 'multipart/form-data')
    .set('Authorization', `Bearer ${token}`)
    .attach('avatar', avatarFile)
    .expect(200);

  const user = await User.findById(userOne._id);

  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  const fieldsToUpdate = {
    name: 'Omar',
    age: 22,
  };

  const { token } = userOne.tokens[0];

  const response = await request(app)
    .patch('/users/me')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send(fieldsToUpdate)
    .expect('Content-Type', /json/)
    .expect(200);

  const updatedUser = await User.findById(userOne._id);

  expect(updatedUser).toMatchObject(fieldsToUpdate);
  expect(response.body).toMatchObject(fieldsToUpdate);
});

test('Should not update invalid user fields', async () => {
  const invalidFields = {
    location: 'Mexico',
    weight: 150,
  };

  const { token } = userOne.tokens[0];

  const response = await request(app)
    .patch('/users/me')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send(invalidFields)
    .expect('Content-Type', /json/)
    .expect(400);

  expect(response.body).toEqual({
    error: 'Invalid updates!',
  });
});
