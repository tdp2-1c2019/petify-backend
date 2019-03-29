const Pool = require('pg').Pool;
const config = require('config');

function ConnectionPoolFactory(logger) {
  let _logger = logger;

  this.createPool = function() {
    let connectionSettings = {
      connectionString: config.get('DATABASE_URL'),
    };
    let pool = new Pool(connectionSettings);
    _logger.debug('Database connection settings: ', connectionSettings);
    return pool;
  };
}

module.exports = ConnectionPoolFactory;
