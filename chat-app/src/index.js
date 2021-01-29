const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');

const users = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 5000;

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('New WebSocket connection');

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profane message, avoid using bad words!');
    }

    const user = users.getUser(socket.id);
    io.to(user.room).emit('message', generateMessage(message, user.username));
    callback();
  });

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    const user = users.getUser(socket.id);
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        `https://google.com/maps?q=${latitude},${longitude}`,
        user.username
      )
    );

    callback();
  });

  socket.on('join', (options, callback) => {
    const { error, user } = users.addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Welcome!', 'Admin'));
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage(`${user.username} has joined!`, 'Admin')
      );

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: users.getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('disconnect', () => {
    const removedUser = users.removeUser(socket.id);

    if (removedUser) {
      io.to(removedUser.room).emit(
        'message',
        generateMessage(`${removedUser.username} has left!`, 'Admin')
      );

      io.to(removedUser.room).emit('roomData', {
        room: removedUser.room,
        users: users.getUsersInRoom(removedUser.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening in port ${port}`);
});
