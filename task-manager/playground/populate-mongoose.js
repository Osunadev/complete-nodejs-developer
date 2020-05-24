const Task = require('./models/task');
const User = require('./models/user');

/* POPULATING THE OWNER OF THE TASK */
const taskId = '5ec9ff3667d93767fa3b4dd9';
const task = await Task.findById(taskId);
// We populate data from the User relationship that Task has
// It's gonna find the user that matches the value of the 'owner' id field
await task.populate('owner').execPopulate();

// Now we populated the owner field replacing the ObjectId that was stored previously,
// with the User that matched with the ObjectId
console.log(task.owner);

/* POPULATING THE TASKS THAT THE OWNER OWNS (FOR THAT, WE CREATED A VIRTUAL PROPERTY) */
const user = await User.findById('5ec9f4e5a72dc54c05c12c99');
await user.populate('tasks').execPopulate();
console.log(user.tasks);
