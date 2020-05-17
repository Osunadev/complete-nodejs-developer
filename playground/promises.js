const add = (a, b) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(a + b);
        }, 2000);
    });
};

// Promise Chaining - The elegant and nice way
add(1, 2)
    .then(sum => {
        return add(sum, 5);
    })
    .then(sum2 => {
        console.log(sum2);
    })
    .catch(err => {
        console.log(err);
    });

// With Async Await - A better choice (More readable)
const numsAddition = async () => {
    const sum = await add(1, 2);
    const sum2 = await add(sum, 5);
    return sum2;
};

numsAddition
    .then(sum => {
        console.log(sum);
    })
    .catch(err => {
        console.log(err);
    });

// The Supeeeer Nested Way
add(1, 2)
    .then(sum => {
        add(sum, 5)
            .then(sum2 => {
                console.log(sum2);
            })
            .catch(err => {
                console.log(err);
            });
    })
    .catch(e => {
        console.log(err);
    });
