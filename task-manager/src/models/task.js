const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // We're creating a reference to the User model and it needs to match
      // the name we gave when defining the user model: mongoose.model('User', userSchema)
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
