const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

// Our userSchema for the User Model, using data validation and sanitization
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('You must provide a valid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [
        6,
        'Your password is weak, it must be at least 6 characters long.',
      ],
      validate(value) {
        if (value.includes('password')) {
          throw new Error(
            `Password insecure, the word 'password' shouldn't be stored as a password.`
          );
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Age must be a positive number');
        }
      },
    },
    // This is an array of objects, having only a 'token' property
    tokens: [
      // This object would be a subdocument, so it will have an _id field
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// We're creating a virtual property, is a relationship between two entities
// It's virtual because we're not actually changing what we store for the user document
// The 'tasks' virtual property name is going to be used for access when using the populate method
userSchema.virtual('tasks', {
  ref: 'Task',
  // This is whre the local data is stored, it's related with the owner field, both are the same id
  localField: '_id',
  // This is the field on the Task document that's going to create this relationship
  foreignField: 'owner',
});

// We can use toJSON property because express is calling the JSON.stringify() method behind
// the scenes when we make our res.send({ someObject })
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  // We're deleting the private properties of the object that we don't wanna send to the user
  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// We implemented a custom generateAuthToken method to be attached to our user instance
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// We implemented a custom findByCredential method to be attached to our User schema model
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

// THESE ARE MIDDLEWARES

/* 
    HASH THE PLAIN TEXT PASSWORD BEFORE SAVING:
    Using this pre hook, we don't have to write a lot of code in each of our endpoints where 
    its needed to modify (as a hash) the password before saving it.
    
    We are passing a middleware function before mongo saves our schema data to the db
    We are using a normal function because arrow functions don't have 'this' binding 
    to the parent context where the functions is called
*/

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// REMOVES USER TASKS WHEN USER IS REMOVED
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
