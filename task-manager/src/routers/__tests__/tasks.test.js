const request = require('supertest');
const Task = require('../../models/task');
const { userOne, setupDatabase } = require('../fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {});
