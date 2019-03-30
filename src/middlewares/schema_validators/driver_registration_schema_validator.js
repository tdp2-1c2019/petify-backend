const SchemaValidator = require('../../utils/schema_validator.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function DriverRegistrationSchemaValidator(logger) {
  let _logger = logger;

  this.validateRequest = function(req, res, next) {
    _logger.debug('Request received: %j', req.body);
    let validator = new SchemaValidator();
    validator.validateJson(req.body, 'driver_registration_request.json', function(err) {
      if (err) {
        _logger.error('The request is invalid');
        let error = new BaseHttpError('The request is invalid', 400);
        next(error);
      } else {
        _logger.info('The request was validated successfully');
        next();
      }
    });
  };
}

module.exports = DriverRegistrationSchemaValidator;
