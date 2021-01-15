const express = require('express');
const User = require('../models/user');

// Multer middleware to manager multipart/form-data
const multer = require('multer');

// Sharp package to resize and change images formats
const sharp = require('sharp');

// Importing our middlewares
const auth = require('../middleware/auth');

const { sendWelcomeEmail, sendCancelEmail } = require('../services/emails');

const router = express.Router();

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();

    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send({
      error,
    });
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // We defined this custom findByCredentials method
    const user = await User.findByCredentials(email, password);

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      tokenObj => tokenObj.token !== req.token
    );
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    // Deleting all of the stored tokens
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

// Http Patch method is only used to update some properties of a resource
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];

  // Array.every() returns true if all of the array elements return true, otherwise returns false
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();

    res.send(req.user);
  } catch (error) {
    // There could be 2 cases:
    // 1. There was a validation error while trying to update: 400
    // 2. There was a server internal error (connection): 500
    res.send(400).send(error); // 1
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelEmail(req.user.email, req.user.name);

    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

const upload = multer({
  limits: {
    fileSize: 1024 * 1024, // 1MB
  },
  fileFilter(req, file, cb) {
    const imgRegex = /\.(jpe?g|png)$/;

    if (!file.originalname.match(imgRegex)) {
      return cb(
        new Error('You must upload an image file in format: jpg, jpeg or png')
      );
    }

    cb(undefined, true);
  },
});

router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({
        width: 250,
        height: 250,
      })
      .png()
      .toBuffer();
    req.user.avatar = buffer;

    await req.user.save();
    res.send();
  },
  // This is our custom Error Handler, overriding the Express Error Handling Implementation
  // Where it sent back an HTML response with the error message at the top.
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;

  await req.user.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send();
  }
});

module.exports = router;
