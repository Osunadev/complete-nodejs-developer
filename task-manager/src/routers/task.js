const express = require('express');
const Task = require('../models/task');

const auth = require('../middleware/auth');

const router = express.Router();

router.post('/tasks', auth, async (req, res) => {
  // We're adding the owner id to Task Document
  const task = new Task({ ...req.body, owner: req.user._id });

  try {
    await task.save();
    res.status(201).send(task);
  } catch {
    res.status(400).send({
      error,
    });
  }
});

// GET /tasks?completed=true                => Filtering
// GET /tasks?page=1&per_page=10            => Pagination
// GET /tasks?sort=created&direction=asc    => Sorting:
//                                             sort_by: 'createdAt'|'updatedAt', direction: 'asc'|'desc'

router.get('/tasks', auth, async (req, res) => {
  // Filtering options
  const match = {};
  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  // Pagination options
  const page = parseInt(req.query.page) || 1; // 1 is the default page
  const limit = parseInt(req.query.per_page) || 10; // 10 is the default page size

  const skip = (page - 1) * limit;

  // Sorting options
  const sort = {};
  if (req.query.sort_by) {
    const validSortOpts = ['createdAt', 'updatedAt'];
    const isSortValid = validSortOpts.includes(req.query.sort_by);
    const sortBy = isSortValid ? req.query.sort_by : 'createdAt'; // 'createdAt' is the default sortBy

    const validDirOpts = ['asc', 'desc'];
    const isDirValid = validDirOpts.includes(req.query.direction);
    const direction = isDirValid ? req.query.direction : 'asc'; // 'asc' is the default direction

    sort[sortBy] = direction === 'asc' ? 1 : -1;
  }

  try {
    /*
        This would be the same thing as:
        
        const tasks = await Task.find({ 
            owner: req.user._id,
            completed: true
        })
        .skip(skip)
        .limit(limit)
        .sort(sort)
    */

    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit,
          skip,
          sort,
        },
      })
      .execPopulate();

    res.send(req.user.tasks);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findOne({ _id: taskId, owner: req.user._id });

    if (!task) return res.status(404).send();
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];

  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    // This approach involves more work than using findByIdAndUpdate, but, by
    // doing this, we can opt to use middlewares (pre or post hooks) later on to
    // handle some properties before actually saving the data to de db.
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach(update => (task[update] = req.body[update]));
    await task.save();

    res.send(task);
  } catch (error) {
    // If validation weren't passed
    res.status(404).send(error);
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const delTask = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!delTask) {
      return res.status(404).send();
    }

    res.send(delTask);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
