function DriverResponseBuilder(logger) {
  let _logger = logger;

  this.buildResponse = function(req, res) {
    let driver = res.driver;

    let response = getBasicResponse();
    response.driver.id = driver.driver_id;
    response.driver.facebook_id = driver.facebook_id;
    response.driver.state = driver.driver_state;
    _logger.debug('Response: %j', response);
    res.status(201).json(response);
  };

  function getBasicResponse() {
    return {
      driver: {
        id: '',
        facebook_id: '',
        state: '',
      },
    };
  }
}

module.exports = DriverResponseBuilder;
