function ClientResponseBuilder(logger) {
  let _logger = logger;

  this.buildResponse = function(req, res) {
    let client = res.client;

    let response = getBasicResponse();
    response.client.id = client.client_id;
    response.client.facebook_id = client.facebook_id;
    response.client.facebook_token = client.facebook_token;
    response.client.state = client.client_state;
    response.client.birth_date = client.birth_date;
    response.client.full_address = client.full_address;
    response.client.full_name = client.full_name;
    response.client.phone_number = client.phone_number;
    _logger.debug('Response: %j', response);
    res.status(201).json(response);
  };

  function getBasicResponse() {
    return {
      client: {
        id: '',
        facebook_id: '',
        facebook_token: '',
        state: '',
        birth_date: '',
        full_address: '',
        full_name: '',
        phone_number: '',
      },
    };
  }
}

module.exports = ClientResponseBuilder;
