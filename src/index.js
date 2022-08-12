const { env, port } = require('./config/vars');
const app = require('./config/app');
const logger = require('./config/logger');

// For testing purposes
app.get('/', (req, res) => {
  res.send("<h2>It's Working!</h2>");
});

app.listen(port, () => {
  logger.info(`API is listening on port ${port} (${env})`);
});

module.exports = app;
