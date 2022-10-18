const { env, port } = require('./config/vars');
const app = require('./config/express');
const logger = require('./config/logger');
const mongoose = require('./config/mongoose');

// open mongoose connection
mongoose.connect();

app.listen(port, () => {
  logger.info(`API is listening on port ${port} (${env})`);
});

module.exports = app;
