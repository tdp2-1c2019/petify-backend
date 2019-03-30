const DriverService = require('../lib/services/driver_service.js');

function DriverController(logger, postgrePool) {
  let _logger = logger;
  let _driverService = new DriverService(logger, postgrePool);

  this.createDriver = async (req, res, next) => {
    try {
      let driver = await _driverService.createDriver(req.body);
      res.driver = driver;
      return next();
    } catch (err) {
      _logger.error('An error occurred while creating driver with facebook_id: %s', req.body.facebook_id);
      return next(err);
    }
  };
}

module.exports = DriverController;
