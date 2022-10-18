const mongoose = require('mongoose');
const logger = require('./logger');
const { mongo, env } = require('./vars');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Exit application on error
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === 'development') {
  mongoose.set('debug', true);
}

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = async () => {
  let uri = mongo;
  let mongodb;
  if (env === 'test') {
    // mocking instance of the MongoDB database
    mongodb = await MongoMemoryServer.create();
    uri = mongodb.getUri();
  }

  mongoose
    .connect(uri, {
      keepAlive: true
    })
    .then(() => {
      if (env !== 'test') {
        logger.info('Successfully connected to MongoDB');
      }
    });
  return { connection: mongoose, mongodb };
};
