const express = require('express');

require('dotenv').config(); // Loading environment variables into process.env from .env file
require('./db/mongoose'); // We just want that the file runs so we can connect to our database

// Importing our routers
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log('Server is up on port ' + port);
});
