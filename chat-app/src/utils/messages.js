const generateMessage = (text, username) => ({
  username,
  message: text,
  createdAt: Date.now(),
});

const generateLocationMessage = (url, username) => ({
  username,
  url,
  createdAt: Date.now(),
});

module.exports = {
  generateMessage,
  generateLocationMessage,
};
