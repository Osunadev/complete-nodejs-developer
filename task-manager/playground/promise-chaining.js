require('../src/db/mongoose');
const User = require('../src/models/user');

// // Using Promises WITHOUT Async Await
// User.findByIdAndUpdate('5ec073d2a76a637835acf075', {
//     age: 1,
// })
//     .then(user => {
//         console.log(user);

//         return User.countDocuments({ age: 1 });
//     })
//     .then(count => {
//         console.log(count);
//     })
//     .catch(err => {
//         console.log(err);
//     });

// Using Promises With Async Await
const updateAgeAndCount = async (userId, age) => {
    const updatedUser = await User.findByIdAndUpdate(userId, { age });
    console.log('Updated user: ' + updatedUser);

    return await User.countDocuments({ age: 1 });
};

updateAgeAndCount('5ec073d2a76a637835acf075', 2)
    .then(usersCount => {
        console.log('Users with age of 1: ' + usersCount);
    })
    .catch(err => {
        console.log(err);
    });
