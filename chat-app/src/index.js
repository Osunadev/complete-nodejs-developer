const express = require('express');
const http = require('http');
const socketio = require('socket.io');
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

  socket.emit('message', 'Welcome!');

  socket.broadcast.emit('message', 'A new user has joined!');

  socket.on('sendMessage', message => {
    io.emit('message', message);
  });

  socket.on('sendLocation', ({ latitude, longitude }) => {
    io.emit('message', `https://google.com/maps?q=${latitude},${longitude}`);
  });

  socket.on('disconnect', () => {
    io.emit('message', 'User has left!');
  });
});

server.listen(port, () => {
  console.log(`Server listening in port ${port}`);
});
