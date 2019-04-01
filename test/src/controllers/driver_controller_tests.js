const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const DriverControllerModule = '../../../src/controllers/driver_controller.js';

let mockDriverService = {
  createDriver: sinon.stub(),
  findDriver: sinon.stub(),
};

let mockLogger = {
  error: sinon.stub(),
};

function setupDriverController() {
  let mocks = {
    '../lib/services/driver_service.js': function() {
 return mockDriverService;
},
  };
  let DriverController = proxyquire(DriverControllerModule, mocks);
  return new DriverController(mockLogger);
}

describe('DriverController Tests', () => {
  let driverController;

  before(() => {
    driverController = setupDriverController();
  });

  beforeEach(() => {
    mockDriverService.createDriver.resetHistory();
  });

  describe('#createDriver', () => {
    let mockDriverRequest = {
      body: {
        facebook_id: 'id'
      },
    };

    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockDriverService.createDriver.resolves( { driver_id: 1, facebook_id: 'facebook_id', driver_state: 'AVAILABLE' });
      });

      it('calls driver service', async () => {
        await driverController.createDriver(mockDriverRequest, mockResponse, function() {});
        expect(mockDriverService.createDriver.calledOnce);
      });

      it('passes correct params to driver service', async () => {
        await driverController.createDriver(mockDriverRequest, mockResponse, function() {});
        expect(mockDriverService.createDriver.getCall(0).args[0]).to.be.eql(mockDriverRequest.body);
      });

      it('saves driver in response', async () => {
        await driverController.createDriver(mockDriverRequest, mockResponse, function() {});
        expect(mockResponse.driver).to.be.ok();
        expect(mockResponse.driver.driver_id).to.be(1);
        expect(mockResponse.driver.facebook_id).to.be('facebook_id');
        expect(mockResponse.driver.driver_state).to.be('AVAILABLE');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await driverController.createDriver(mockDriverRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockDriverService.createDriver.rejects(new Error('creation error'));
      });

      it('calls driver service', async () => {
        await driverController.createDriver(mockDriverRequest, mockResponse, function() {});
        expect(mockDriverService.createDriver.calledOnce);
      });

      it('passes correct params to driver service', async () => {
        await driverController.createDriver(mockDriverRequest, mockResponse, function() {});
        expect(mockDriverService.createDriver.getCall(0).args[0]).to.be.eql(mockDriverRequest.body);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await driverController.createDriver(mockDriverRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('creation error')));
      });
    });
  });

  describe('#findDriver', () => {
    let mockDriverRequest = {
      query: {
        facebook_id: 1,
      },
    };

    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockDriverService.findDriver.resolves({ driver_id: 1, facebook_id: 'facebook_id', driver_state: 'ACTIVE' });
      });

      it('calls driver service', async () => {
        await driverController.findDriver(mockDriverRequest, mockResponse, function() {});
        expect(mockDriverService.findDriver.calledOnce);
      });

      it('passes correct params to driver service', async () => {
        await driverController.findDriver(mockDriverRequest, mockResponse, function() {});
        expect(mockDriverService.findDriver.getCall(0).args[0]).to.be.eql(1);
      });

      it('saves driver in response', async () => {
        await driverController.findDriver(mockDriverRequest, mockResponse, function() {});
        expect(mockResponse.driver).to.be.ok();
        expect(mockResponse.driver.driver_id).to.be(1);
        expect(mockResponse.driver.facebook_id).to.be('facebook_id');
        expect(mockResponse.driver.driver_state).to.be('ACTIVE');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await driverController.findDriver(mockDriverRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockDriverService.findDriver.rejects(new Error('find error'));
      });

      it('calls driver service', async () => {
        await driverController.findDriver(mockDriverRequest, mockResponse, function() {});
        expect(mockDriverService.findDriver.calledOnce);
      });

      it('passes correct params to driver service', async () => {
        await driverController.findDriver(mockDriverRequest, mockResponse, function() {});
        expect(mockDriverService.findDriver.getCall(0).args[0]).to.be.eql(1);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await driverController.findDriver(mockDriverRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('find error')));
      });
    });
  });
});
