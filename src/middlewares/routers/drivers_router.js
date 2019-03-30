const DriverRegistrationSchemaValidator = require('../schema_validators/driver_registration_schema_validator.js');
const DriverController = require('../../controllers/driver_controller.js');
const DriverResponseBuilder = require('../response_builders/driver_response_builder.js');


function DriversRouter(app, logger, postgrePool) {
  let _driverRegistrationSchemaValidator = new DriverRegistrationSchemaValidator(logger);
  let _driverController = new DriverController(logger, postgrePool);
  let _driverResponseBuilder = new DriverResponseBuilder(logger);

  app.post('/api/driver',
    _driverRegistrationSchemaValidator.validateRequest,
    _driverController.createDriver,
    _driverResponseBuilder.buildResponse
  );
}


module.exports = DriversRouter;
