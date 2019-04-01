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

  this.findClient = async (req, res, next) => {
    let clientFound;
    try {
      clientFound = await _clientService.findClient(req.query.facebook_id);
    } catch (err) {
      _logger.error('An error occurred while finding client with facebook_id: %s', req.query.facebook_id);
      return next(err);
    }
    res.client = clientFound;
    return next();
  };
}

module.exports = ClientController;
