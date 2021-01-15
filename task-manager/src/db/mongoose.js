const mongoose = require('mongoose');

const { mongoDbUri } = require('../config');

// Only handling the connection to the db server
mongoose.connect(mongoDbUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
