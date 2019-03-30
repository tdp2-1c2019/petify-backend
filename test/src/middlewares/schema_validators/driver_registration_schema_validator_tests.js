const expect = require('expect.js');
const sinon = require('sinon');
const DriverRegistrationSchemaValidator = require('../../../../src/middlewares/schema_validators/driver_registration_schema_validator.js');

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

const driverRegistrationSchemaValidator = new DriverRegistrationSchemaValidator(mockLogger);

describe('DriverRegistrationSchemaValidator Tests', function() {
  describe('#validateRequest', function() {
    describe('valid request', function() {
      let request = {
        body: {
          'facebook_id': 'facebook_id',
          'facebook_token': 'facebook_token',
        },
      };

      it('does not return error', function(done) {
        driverRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.null;
          done();
        });
      });
    });

    describe('invalid request with token', function() {
      let request = {
        body: {
          'facebook_id': 'facebook_id',
          'facebook_token': 'facebook_token',
          'token': 'token',
        },
      };

      it('returns error', function(done) {
        driverRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });

    describe('invalid request without facebook_token', function() {
      let request = {
        body: {
          'facebook_id': 'facebook_id',
        },
      };

      it('returns error', function(done) {
        driverRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });

    describe('request with empty body', function() {
      let request = {
        body: {},
      };

      it('returns error', function(done) {
        driverRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });

    describe('request with null body', function() {
      let request = {};

      it('returns error', function(done) {
        driverRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });
  });
});

