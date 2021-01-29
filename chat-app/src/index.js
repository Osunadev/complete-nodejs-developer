const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');
/*
  We're re-utilizing our same port, so that our Express app
  and socket.io Server run on the same http server. Remember that
  under the hood, app.listen is implemented this way:

  app.listen = function(){
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  };

  To learn more how Express and Socket-io can work together:
  https://hub.packtpub.com/using-socketio-and-express-together/
*/
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 5000;

app.use(express.static('public'));

/*
  socket.emit - Emits to the single client
  io.emit - Emits to every client
  socket.broadcast.emit - Emits to every client except the particular client
*/
io.on('connection', socket => {
  console.log('New WebSocket connection');

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    const msgHasBadWords = filter.isProfane(message);

    if (msgHasBadWords) {
      return callback('Profane message, avoid using bad words!');
    }

    io.to('something').emit('message', generateMessage(message));
    // This callback is to acknowledge that the server received client's message
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
