const ClientResponseBuilder = require('./client_response_builder.js');
const DriverResponseBuilder = require('./driver_response_builder.js');

function UserResponseBuilder(logger) {
  let _clientResponseBuilder = new ClientResponseBuilder(logger);
  let _driverResponseBuilder = new DriverResponseBuilder(logger);

  this.buildResponse = function(req, res, next) {
    if (res.client){
      return _clientResponseBuilder.buildResponse(req, res, next);
    } else if (res.driver){
      return _driverResponseBuilder.buildResponse(req, res, next);
    }
  };
}

module.exports = UserResponseBuilder;
