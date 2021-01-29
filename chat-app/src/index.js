const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 5000;

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('New WebSocket connection');

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    const msgHasBadWords = filter.isProfane(message);

    if (msgHasBadWords) {
      return callback('Profane message, avoid using bad words!');
    }

    io.to('something').emit('message', generateMessage(message));
    callback();
  });

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    io.emit(
      'locationMessage',
      generateLocationMessage(
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );

    callback();
  });

  socket.on('join', ({ username, room }) => {
    socket.join(room);

    socket.emit('message', generateMessage('Welcome!'));
    socket.broadcast
      .to(room)
      .emit('message', generateMessage(`${username} has joined!`));
  });

  socket.on('disconnect', () => {
    io.emit('message', generateMessage('User has left!'));
  });
});

server.listen(port, () => {
  console.log(`Server listening in port ${port}`);
});
