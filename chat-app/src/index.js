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

let count = 0;

io.on('connection', socket => {
  console.log('New WebSocket connection');

  // This is emitting the event only to the particular connection
  socket.emit('countUpdated', count);

  socket.on('increment', () => {
    count++;
    // This is emitting the event to every single connection
    io.emit('countUpdated', count);
  });
});

server.listen(port, () => {
  console.log(`Server listening in port ${port}`);
});
