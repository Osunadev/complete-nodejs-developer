const express = require('express');
// We just want that the file runs so we can connect to our database
require('./db/mongoose');
// Importing our models
const User = require('./models/user');
const Task = require('./models/task');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.post('/users', (req, res) => {
    const user = new User(req.body);

    user.save()
        .then(() => {
            res.status(201).send(user);
        })
        .catch(error => {
            res.status(400).send({
                error,
            });
        });
});

app.get('/users', (req, res) => {
    User.find({})
        .then(users => {
            res.send(users);
        })
        .catch(e => {
            res.status(500).send();
        });
});

app.get('/users/:id', (req, res) => {
    const userId = req.params.id;

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).send();
            }

            res.send(user);
        })
        .catch(e => {
            res.status(500).send();
        });
});

app.post('/tasks', (req, res) => {
    const task = new Task(req.body);

    task.save()
        .then(() => {
            res.status(201).send(task);
        })
        .catch(error => {
            res.status(400).send({
                error,
            });
        });
});

app.get('/tasks', (req, res) => {
    Task.find({})
        .then(tasks => {
            res.send(tasks);
        })
        .catch(e => {
            res.status(500).send();
        });
});

app.get('/tasks/:id', (req, res) => {
    const taskId = req.params.id;

    Task.findById(taskId)
        .then(task => {
            if (!task) return res.status(404).send();

            res.send(task);
        })
        .catch(e => {
            res.send(500).send();
        });
});

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});
