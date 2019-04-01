const expect = require('expect.js');
const sinon = require('sinon');
const DriverResponserBuilder = require('../../../../src/middlewares/response_builders/driver_response_builder.js');

const mockLogger = {
  debug: sinon.stub(),
};

describe('DriverResponserBuilder Tests', function() {
  let driverResponseBuilder = new DriverResponserBuilder(mockLogger);

  describe('#buildResponse', function() {
    let mockRequest = {};
    let passedStatusCode;
    let returnedResponse;
    let mockResponse = {
      driver: {
        driver_id: 123456789,
        facebook_id: 'facebook_id',
        driver_state: 'AVAILABLE',
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
      driverResponseBuilder.buildResponse(mockRequest, mockResponse);
    });

    it('passes status and response', function() {
      expect(passedStatusCode).to.be(201);
      expect(returnedResponse).to.be.eql({ driver: { id: 123456789, facebook_id: 'facebook_id', state: 'AVAILABLE' } });
    });

    it('logs response', function() {
      expect(mockLogger.debug.calledOnce);
      expect(mockLogger.debug.getCall(0).args[0]).to.be('Response: %j');
      expect(mockLogger.debug.getCall(0).args[1]).to.be.eql( { driver: { id: 123456789, facebook_id: 'facebook_id', state: 'AVAILABLE' } });
    });
  });
});
