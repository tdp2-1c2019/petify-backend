const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const BaseHttpError = require('../../../../src/errors/base_http_error.js');
const DriverServiceModule = '../../../../src/lib/services/driver_service.js';

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
};

const mockDriverModel = {
  findByFacebookId: sinon.stub(),
  create: sinon.stub(),
};

function setupDriverService() {
  let mocks = {
    '../../models/driver_model.js': function() {
 return mockDriverModel;
},
  };
  let DriverService = proxyquire(DriverServiceModule, mocks);
  return new DriverService(mockLogger);
}


describe('DriverService Tests', () => {
  let driverService;

  before(() => {
    driverService = setupDriverService();
  });

  describe('#createDriver', () => {
    let mockBody = {
      facebook_id: 'facebook_id',
      facebook_token: 'token',
    };

    describe('create success', () => {
      before(() => {
        mockDriverModel.create.resolves({ driver_id: 1, facebook_id: 'facebook_id',
          facebook_token: 'token', driver_state: 'AVAILABLE', });
      });

      it('returns driver', async () => {
        let driver = await driverService.createDriver(mockBody);
        expect(driver).to.be.ok();
        expect(driver.driver_id).to.be(1);
        expect(driver.facebook_id).to.be('facebook_id');
        expect(driver.facebook_token).to.be('token');
        expect(driver.driver_state).to.be('AVAILABLE');
      });
    });

    describe('create failure', () => {
      before(() => {
        mockDriverModel.create.rejects(new Error('Creation error'));
      });

      describe('driver found', () => {
        before(() => {
          mockDriverModel.findByFacebookId.resolves({ driver_id: 1, facebook_id: 'facebook_id',
            facebook_token: 'token', driver_state: 'AVAILABLE', });
        });

        it('returns error', async () => {
          let err;
          try {
            await driverService.createDriver(mockBody);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.a(BaseHttpError);
          expect(err.statusCode).to.be(409);
          expect(err.message).to.be('Facebook Id already exists');
        });
      });

      describe('driver not found', () => {
        before(() => {
          mockDriverModel.findByFacebookId.rejects(new Error('driver not found'));
        });

        it('returns error', async () => {
          let err;
          try {
            await driverService.createDriver(mockBody);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err).to.be.a(BaseHttpError);
          expect(err.statusCode).to.be(500);
          expect(err.message).to.be('Driver creation error');
        });
      });
    });
  });
});
