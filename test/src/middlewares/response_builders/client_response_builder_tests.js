const expect = require('expect.js');
const sinon = require('sinon');
const ClientResponserBuilder = require('../../../../src/middlewares/response_builders/client_response_builder.js');

const mockLogger = {
  debug: sinon.stub(),
};

describe('ClientResponserBuilder Tests', function() {
  let clientResponseBuilder = new ClientResponserBuilder(mockLogger);

  describe('#buildResponse', function() {
    let mockRequest = {};
    let passedStatusCode;
    let returnedResponse;
    let mockResponse = {
      client: {
        client_id: 123456789,
        facebook_id: 'facebook_id',
        client_state: 'ACTIVE',
        birth_date: '1999-09-09',
        full_address: 'address',
        full_name: 'John Doe',
        phone_number: '123456789',
      },
      status: function(statusCode) {
        passedStatusCode = statusCode;
        return {
          json: function(responseBody) {
            returnedResponse = responseBody;
          },
        };
      },
    };

    beforeEach(function() {
      mockLogger.debug.resetHistory();
      clientResponseBuilder.buildResponse(mockRequest, mockResponse);
    });

    it('passes status and response', function() {
      expect(passedStatusCode).to.be(201);
      expect(returnedResponse).to.be.eql({ client: { id: 123456789, facebook_id: 'facebook_id', state: 'ACTIVE', birth_date: '1999-09-09',
          full_address: 'address', full_name: 'John Doe', phone_number: '123456789' } });
    });

    it('logs response', function() {
      expect(mockLogger.debug.calledOnce);
      expect(mockLogger.debug.getCall(0).args[0]).to.be('Response: %j');
      expect(mockLogger.debug.getCall(0).args[1]).to.be.eql( { client: { id: 123456789, facebook_id: 'facebook_id', state: 'ACTIVE', birth_date: '1999-09-09',
          full_address: 'address', full_name: 'John Doe', phone_number: '123456789' } });
    });
  });
});
