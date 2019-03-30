const DriverModel = require('../../models/driver_model.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function DriverService(logger, postgrePool) {
  let _logger = logger;
  let _driverModel = new DriverModel(logger, postgrePool);

  this.createDriver = async (body) => {
    let driverData = {
      facebook_id: body.facebook_id,
      facebook_token: body.facebook_token,
    };
    let err;
    try {
      return await _driverModel.create(driverData);
    } catch (createErr) {
      err = createErr;
    }
    if (err) {
      let driverFind;
      try {
        driverFind = await _driverModel.findByFacebookId(driverData.facebook_id);
      } catch (findErr) {
        _logger.error('An error happened while creating the driver: \'%s\'', driverData.facebook_id);
        throw new BaseHttpError('Driver creation error', 500);
      }
      if (driverFind) {
        _logger.error('There is already a driver with facebook_id: \'%s\'', driverData.facebook_id);
        throw new BaseHttpError('Facebook Id already exists', 409);
      } else {
        _logger.debug('Unknown error on driver creation. Driver: \'%j\'', driverData);
        throw new BaseHttpError('Driver creation error', 500);
      }
    }
  };

  this.findDriver = async (driverId) => {
    let driver;
    try {
      driver = await _driverModel.findByDriverId(driverId);
    } catch (findErr) {
      _logger.error('An error happened while looking for the driver with id: \'%s\'', driverId);
      throw new BaseHttpError('Driver find error', 500);
    }
    if (driver) {
      return driver;
    } else {
      _logger.error('The driver with id: \'%s\' was not found', driverId);
      throw new BaseHttpError('Driver does not exist', 404);
    }
  };
}

module.exports = DriverService;
