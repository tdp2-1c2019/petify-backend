const expect = require('expect.js');
const sinon = require('sinon');
const ClientRegistrationSchemaValidator = require('../../../../src/middlewares/schema_validators/client_registration_schema_validator.js');

const mockLogger = {
  debug: sinon.stub(),
  error: sinon.stub(),
  info: sinon.stub(),
};

const mockResponse = {
  status: function() {
    return { json: sinon.stub() };
  },
};

const clientRegistrationSchemaValidator = new ClientRegistrationSchemaValidator(mockLogger);

describe('ClientRegistrationSchemaValidator Tests', function() {
  describe('#validateRequest', function() {
    describe('valid request', function() {
      let request = {
        body: {
          'facebook_id': 'facebook_id'
        },
      };

      it('does not return error', function(done) {
        clientRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.null;
          done();
        });
      });
    });

    describe('request with empty body', function() {
      let request = {
        body: {},
      };

      it('returns error', function(done) {
        clientRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });

    describe('request with null body', function() {
      let request = {};

      it('returns error', function(done) {
        clientRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });
  });
});

