// CRUD

const mongodb = require('mongodb');
const { ObjectID, MongoClient } = mongodb;

const connectionURL = 'mongodb://127.0.0.1:27017';
const dbName = 'task-manager';

// * We're using a newUrlParser cause the old one is being deprecated, so our URL couldn't be recognized well
// * Our callback is going to be called when we connect to the database
MongoClient.connect(
    connectionURL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (error, client) => {
        if (error) return console.log('Unable to connect to database!');

        const db = client.db(dbName);

        db.collection('users')
            .deleteMany({ age: 21 })
            .then(console.log)
            .catch(console.log);
    }
);
