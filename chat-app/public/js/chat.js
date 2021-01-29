const socket = io();

socket.on('message', message => {
  console.log(message);
});

document.getElementById('message-form').addEventListener('submit', event => {
  event.preventDefault();
  const messageInput = event.target.elements['message'];

  socket.emit('sendMessage', messageInput.value);

  messageInput.value = '';
});

document.getElementById('send-location').addEventListener('click', () => {
  const locationAvailable = 'geolocation' in navigator;

  if (!locationAvailable) {
    return alert('Geolocation is not supported by your browser');
  }

  navigator.geolocation.getCurrentPosition(position => {
    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    socket.emit('sendLocation', coords);
  });
});
