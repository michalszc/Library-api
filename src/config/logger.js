const winston = require('winston');
const { env } = require('./vars');
const { environments } = require('./constants');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${log.timestamp} ${log.level}: ${log.message} `
//
if (env !== environments.PRODUCTION) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.align(),
      winston.format.printf(log => `${log.timestamp} ${log.level}: ${log.message}`)
    )
  }));
}

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;
