const express = require('express');

require('dotenv').config(); // Loading environment variables into process.env from .env file
require('./db/mongoose'); // We just want that the file runs so we can connect to our database

// Importing our routers
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT || 5000;

const multer = require('multer');

// Specifying that multer needs to save incoming files in the 'images' folder
const oneMb = 1024 * 1024;

const upload = multer({
  dest: 'images',
  limits: {
    fileSize: oneMb,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(doc|docx)$/)) {
      return cb(new Error('Please upload a Word Document'));
    }

    // We're telling multer that it should save the file (true)
    cb(undefined, true);
  },
});

app.post('/upload', upload.single('upload'), (req, res) => {
  res.send();
});

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log('Server is up on port ' + port);
});
