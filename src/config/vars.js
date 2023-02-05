require('dotenv').config();
const { environments } = require('./constants');

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  logs: process.env.NODE_ENV === environments.PRODUCTION ? 'combined' : 'dev',
  mongo: process.env.MONGO_URI
};
