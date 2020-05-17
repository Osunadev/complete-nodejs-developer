require('../src/db/mongoose');
const Task = require('../src/models/task');

async function deleteAndCountTasks(taskId) {
    const deletedTask = await Task.findByIdAndDelete(taskId);
    console.log('Task deleted: ' + deletedTask);

    return await Task.countDocumen({ completed: false });
}

deleteAndCountTasks('5ec081894abb4211cec71ac3')
    .then(countTasks => {
        console.log('Tasks with "completed" = "false" ' + countTasks);
    })
    .catch(err => {
        console.log(err.message);
    });

// OR WELL, USING A TRY CATCH INSIDE OF THE ASYNC FUNCTION
async function deleteAndCountTasks(taskId) {
    try {
        const deletedTask = await Task.findByIdAndDelete(taskId);
        console.log('Task deleted: ' + deletedTask);

        return await Task.countDocumen({ completed: false });
    } catch (err) {
        console.log(err.message);
    }
}

deleteAndCountTasks('5ec081894abb4211cec71ac3').then(countTasks => {
    console.log('Tasks with "completed" = "false" ' + countTasks);
});
