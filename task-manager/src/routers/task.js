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

router.get('/tasks', auth, async (req, res) => {
    try {
        // This would be the same thing: const tasks = await Task.find({ owner: req.user._id });
        await req.user.populate('tasks').execPopulate();

        res.send(req.user.tasks);
    } catch (error) {
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
