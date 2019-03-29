const { createLogger, format, transports } = require('winston');
const { splat, simple } = format;
const logFilename = 'all-logs.log';

function Logger() {
  const level = process.env.LOG_LEVEL || 'debug';

  const logger = createLogger({
    transports: [
      new transports.File({
        level: level,
        filename: logFilename,
      }),
      new transports.Console({
        level: level,
        format: format.combine(splat(), simple()),
      }),
    ],
  });

  this.error = function(...args) {
    logger.error.apply(null, args);
  };

  this.info = function(...args) {
    logger.info.apply(null, args);
  };

  this.debug = function(...args) {
    logger.debug.apply(null, args);
  };

  this.warn = function(...args) {
    logger.warn.apply(null, args);
  };
}

module.exports = Logger;
