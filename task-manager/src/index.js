const app = require('./app');
const { port } = require('./config');

app.listen(port, () => {
  console.log('Server is up on port ' + port);
});
