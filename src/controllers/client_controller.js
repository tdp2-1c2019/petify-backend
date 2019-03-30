const ClientService = require('../lib/services/client_service.js');

function ClientController(logger, postgrePool) {
  let _logger = logger;
  let _clientService = new ClientService(logger, postgrePool);

  this.createClient = async (req, res, next) => {
    try {
      let client = await _clientService.createClient(req.body);
      res.client = client;
      return next();
    } catch (err) {
      _logger.error('An error occurred while creating client with facebook_id: %s', req.body.facebook_id);
      return next(err);
    }
  };
}

module.exports = ClientController;
