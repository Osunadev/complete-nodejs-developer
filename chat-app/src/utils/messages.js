const generateMessage = text => ({
  message: text,
  createdAt: Date.now(),
});

const generateLocationMessage = url => ({
  url,
  createdAt: Date.now(),
});

module.exports = {
  generateMessage,
  generateLocationMessage,
};
