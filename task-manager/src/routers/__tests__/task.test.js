const request = require('supertest');

const app = require('../../app');
const Task = require('../../models/task');
const { users, tasks, setupDatabase } = require('../fixtures/db');

const { userOne, userTwo } = users;

beforeEach(setupDatabase);

test('Should create task for user', async () => {
  const { token } = userOne.tokens[0];

  const description = 'This is a new task';

  const response = await request(app)
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send({ description })
    .expect(201);

  const taskId = response.body._id;
  const task = await Task.findById(taskId);

  expect(task).toMatchObject({
    description,
    completed: false,
    owner: userOne._id,
  });
});

test('Should get all tasks for user', async () => {
  const { token } = userOne.tokens[0];

  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body.length).toBe(2);
});

test('Should not delete tasks the user does not owns', async () => {
  const userTwoToken = userTwo.tokens[0].token;

  // One of the 2 tasks userOne has
  const userOneTask = tasks.taskOne;

  await request(app)
    .delete(`/tasks/${userOneTask._id}`)
    .set('Authorization', `Bearer ${userTwoToken}`)
    .send()
    .expect(404);

  const task = await Task.findById(userOneTask._id);

  expect(task).not.toBeNull();
});
