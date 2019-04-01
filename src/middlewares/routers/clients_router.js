const ClientRegistrationSchemaValidator = require('../schema_validators/client_registration_schema_validator.js');
const ClientController = require('../../controllers/client_controller.js');
const ClientResponseBuilder = require('../response_builders/client_response_builder.js');


function ClientsRouter(app, logger, postgrePool) {
  let _clientRegistrationSchemaValidator = new ClientRegistrationSchemaValidator(logger);
  let _clientController = new ClientController(logger, postgrePool);
  let _clientResponseBuilder = new ClientResponseBuilder(logger);

  app.post('/api/client',
    _clientRegistrationSchemaValidator.validateRequest,
    _clientController.createClient,
    _clientResponseBuilder.buildResponse
  );

  app.get('/api/client',
    _clientController.findClient,
    _clientResponseBuilder.buildResponse
  );
}


module.exports = ClientsRouter;
