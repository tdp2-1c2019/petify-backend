function ClientModel(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;

  function getBusinessClient(dbClient) {
    return {
      client_id: dbClient.client_id,
      facebook_id: dbClient.facebook_id,
      facebook_token: dbClient.facebook_token,
      client_state: dbClient.client_state,
      birth_date: dbClient.birth_date,
      full_address: dbClient.full_address,
      full_name: dbClient.full_name,
      phone_number: dbClient.phone_number,
    };
  };

  async function findByFacebookIdReturnAllParams(facebook_id) {
    let query = 'SELECT client_id, facebook_id, client_state, birth_date, full_address, full_name, phone_number FROM clients WHERE facebook_id = $1;';
    let values = [facebook_id];
    try {
      let response = await executeQuery(query, values);
      if (response.rows.length == 0) {
        _logger.info('Client with facebook_id:\'%s\' not found', facebook_id);
        return;
      } else if (response.rows.length > 1) {
        _logger.warn('More than a client found for facebook_id: %s');
        return response.rows[0];
      } else {
        _logger.info('Client with facebook_id:\'%s\' found', facebook_id);
        return response.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for facebook_id:\'%s\' in the database', facebook_id);
      throw err;
    }
  }

  async function findByClientIdReturnAllParams(clientId) {
    let query = 'SELECT client_id, facebook_id, client_state, birth_date, full_address, full_name, phone_number FROM clients WHERE client_id = $1;';
    let values = [clientId];
    try {
      let res = await executeQuery(query, values);
      if (res.rows.length == 0) {
        _logger.info('Client with id:\'%s\' not found', clientId);
        return;
      } else {
        _logger.info('Client with id:\'%s\' found', clientId);
        return res.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for client id:\'%s\' in the database', clientId);
      throw err;
    }
  }

  this.findByFacebookId = async (facebook_id) => {
    let client = await findByFacebookIdReturnAllParams(facebook_id);
    return client ? getBusinessClient(client) : null;
  };

  this.findByClientId = async (serverId) => {
    let dbClient = await findByClientIdReturnAllParams(serverId);
    return dbClient ? getBusinessClient(dbClient) : null;
  };

  this.create = async (client) => {
    let query = 'INSERT INTO clients(facebook_id, birth_date, full_address, full_name, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING client_id, facebook_id, client_state, birth_date, full_address, full_name, phone_number;';
    let values = [client.facebook_id, client.birth_date, client.full_address, client.full_name, client.phone_number ];
    let response;
    try {
      response = await executeQuery(query, values);
    } catch (err) {
      _logger.error('Error creating client with facebook_id:\'%s\' to database', client.facebook_id);
      throw err;
    }
    _logger.info('Client: \'%s\' created successfully', client.facebook_id);
    _logger.debug('Client created in db: %j', response.rows[0]);
    return getBusinessClient(response.rows[0]);
  };

  async function executeQuery(query, values) {
    const client = await _postgrePool.connect();
    try {
      let response = await client.query(query, values);
      _logger.debug('Postgre response: %j', response);
      return response;
    } catch (err) {
      _logger.error('DB error: %j', err.message);
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = ClientModel;
