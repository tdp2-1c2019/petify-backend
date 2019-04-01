const ClientModel = require('../../models/client_model.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function ClientService(logger, postgrePool) {
  let _logger = logger;
  let _clientModel = new ClientModel(logger, postgrePool);

  this.createClient = async (body) => {
    let clientData = {
      facebook_id: body.facebook_id
    };
    let err;
    try {
      return await _clientModel.create(clientData);
    } catch (createErr) {
      err = createErr;
    }
    if (err) {
      let clientFind;
      try {
        clientFind = await _clientModel.findByFacebookId(clientData.facebook_id);
      } catch (findErr) {
        _logger.error('An error happened while creating the client: \'%s\'', clientData.facebook_id);
        throw new BaseHttpError('Client creation error', 500);
      }
      if (clientFind) {
        _logger.error('There is already a client with facebook_id: \'%s\'', clientData.facebook_id);
        throw new BaseHttpError('Facebook Id already exists', 409);
      } else {
        _logger.debug('Unknown error on client creation. Client: \'%j\'', clientData);
        throw new BaseHttpError('Client creation error', 500);
      }
    }
  };

  this.findClient = async (facebookId) => {
    let client;
    try {
      client = await _clientModel.findByFacebookId(facebookId);
    } catch (findErr) {
      _logger.error('An error happened while looking for the client with facebook_id: \'%s\'', facebookId);
      throw new BaseHttpError('Client find error', 500);
    }
    if (client) {
      return client;
    } else {
      _logger.error('The client with facebook_id: \'%s\' was not found', facebookId);
      throw new BaseHttpError('Client does not exist', 404);
    }
  };
}

module.exports = ClientService;
