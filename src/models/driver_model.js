function DriverModel(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;

  function getBusinessDriver(dbDriver) {
    return {
      driver_id: dbDriver.driver_id,
      facebook_id: dbDriver.facebook_id,
      facebook_token: dbDriver.facebook_token,
      driver_state: dbDriver.driver_state
    };
  };

  async function findByFacebookIdReturnAllParams(facebook_id) {
    let query = 'SELECT driver_id, facebook_id, facebook_token, driver_state FROM drivers WHERE facebook_id = $1;';
    let values = [facebook_id];
    try {
      let response = await executeQuery(query, values);
      if (response.rows.length == 0) {
        _logger.info('Driver with facebook_id:\'%s\' not found', facebook_id);
        return;
      } else if (response.rows.length > 1) {
        _logger.warn('More than a driver found for facebook_id: %s');
        return response.rows[0];
      } else {
        _logger.info('Driver with facebook_id:\'%s\' found', facebook_id);
        return response.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for facebook_id:\'%s\' in the database', facebook_id);
      throw err;
    }
  }

  async function findByDriverIdReturnAllParams(driverId) {
    let query = 'SELECT driver_id, facebook_id, facebook_token, driver_state FROM drivers WHERE driver_id = $1;';
    let values = [driverId];
    try {
      let res = await executeQuery(query, values);
      if (res.rows.length == 0) {
        _logger.info('Driver with id:\'%s\' not found', driverId);
        return;
      } else {
        _logger.info('Driver with id:\'%s\' found', driverId);
        return res.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for driver id:\'%s\' in the database', driverId);
      throw err;
    }
  }

  this.findByFacebookId = async (facebook_id) => {
    let driver = await findByFacebookIdReturnAllParams(facebook_id);
    return driver ? getBusinessDriver(driver) : null;
  };

  this.findByDriverId = async (serverId) => {
    let dbDriver = await findByDriverIdReturnAllParams(serverId);
    return dbDriver ? getBusinessDriver(dbDriver) : null;
  };

  this.create = async (driver) => {
    let query = 'INSERT INTO drivers(facebook_id, facebook_token) VALUES ($1, $2) RETURNING driver_id, facebook_id, facebook_token, driver_state;';
    let values = [driver.facebook_id, driver.facebook_token ];
    let response;
    try {
      response = await executeQuery(query, values);
    } catch (err) {
      _logger.error('Error creating driver with facebook_id:\'%s\' to database', driver.facebook_id);
      throw err;
    }
    _logger.info('Driver: \'%s\' created successfully', driver.facebook_id);
    _logger.debug('Driver created in db: %j', response.rows[0]);
    return getBusinessDriver(response.rows[0]);
  };

  async function executeQuery(query, values) {
    const driver = await _postgrePool.connect();
    try {
      let response = await driver.query(query, values);
      _logger.debug('Postgre response: %j', response);
      return response;
    } catch (err) {
      _logger.error('DB error: %j', err.message);
      throw err;
    } finally {
      driver.release();
    }
  }
}

module.exports = DriverModel;
