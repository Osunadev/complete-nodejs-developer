const express = require('express');

require('./db/mongoose'); // We just want that the file runs so we can connect to our database

// Importing our routers
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
