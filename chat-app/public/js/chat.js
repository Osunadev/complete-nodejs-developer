const socket = io();

// Elements
const $messageForm = document.getElementById('message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.getElementById('send-location');
const $messages = document.getElementById('messages');
const $sidebar = document.getElementById('sidebar');

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

function getDisplayAuthor(author) {
  const myUserName = username.trim().toLowerCase();
  // Checking if we're receiving the message we sent, w
  return author === myUserName ? 'Me' : author;
}

function autoscroll() {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Scroll Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const messagesContainerHeight = $messages.scrollHeight;

  // How far have I scrolled
  const scrollOffset = visibleHeight + $messages.scrollTop;

  // We use Math.round because we end up with decimal heights
  const isUserAtTheBottom =
    Math.round(messagesContainerHeight - newMessageHeight - 1) <=
    Math.round(scrollOffset);

  if (isUserAtTheBottom) {
    // Updating the scroll position to the latest message
    $messages.scrollTop = $messages.scrollHeight;
  }
}

socket.on('message', data => {
  const html = Mustache.render(messageTemplate, {
    username: getDisplayAuthor(data.username),
    message: data.message,
    createdAt: moment(data.createdAt).format('hh:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', data => {
  const html = Mustache.render(locationTemplate, {
    username: getDisplayAuthor(data.username),
    url: data.url,
    createdAt: moment(data.createdAt).format('hh:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  sidebar.innerHTML = html;
});

$messageForm.addEventListener('submit', e => {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');

  socket.emit('sendMessage', $messageFormInput.value, error => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log('Message delivered!');
  });
});

$locationButton.addEventListener('click', () => {
  const locationAvailable = 'geolocation' in navigator;

  if (!locationAvailable) {
    return alert('Geolocation is not supported by your browser');
  }

  $locationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(position => {
    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    socket.emit('sendLocation', coords, () => {
      $locationButton.removeAttribute('disabled');
      console.log('Location shared!');
    });
  });
});

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
