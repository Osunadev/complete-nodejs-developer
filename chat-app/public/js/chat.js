const socket = io();

// This 'countUpdated' event needs to match with the event
// that we're emitting on the backend
socket.on('countUpdated', count => {
  console.log('The count has been updated!', count);
});

document.getElementById('increment').addEventListener('click', () => {
  console.log('Clicked');
  socket.emit('increment');
});
