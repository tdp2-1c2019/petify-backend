const ClientService = require('../lib/services/client_service.js');
const DriverService = require('../lib/services/driver_service.js');
const BaseHttpError = require('../errors/base_http_error.js');

function UserController(logger, postgrePool) {
  let _logger = logger;
  let _clientService = new ClientService(logger, postgrePool);
  let _driverService = new DriverService(logger, postgrePool);

  this.findUser = async (req, res, next) => {
    let clientFound;
    try {
      clientFound = await _clientService.findClient(req.query.facebook_id);
    } catch (err) {
      let driverFound;
      try {
        driverFound = await _driverService.findDriver(req.query.facebook_id);
      } catch (err) {
        _logger.error('An error occurred while finding user with facebook_id: %s', req.query.facebook_id);
        return next(new BaseHttpError('User does not exist', 404));
      }
      res.driver = driverFound;
      return next();
    }
    res.client = clientFound;
    return next();
  };
}

module.exports = UserController;
