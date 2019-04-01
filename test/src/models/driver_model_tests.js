const expect = require('expect.js');
const sinon = require('sinon');
const DriverModel = require('../../../src/models/driver_model.js');

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
  warn: sinon.stub(),
  debug: sinon.stub(),
};

const mockDb = {
  query: sinon.stub(),
  release: sinon.stub(),
};

const mockPool = {
  connect: () => {
    return mockDb;
  },
};

function createDriverModel() {
  mockDb.release.returns();
  return new DriverModel(mockLogger, mockPool);
}

const driverModel = createDriverModel();

describe('DriverModel Tests', () => {
  beforeEach(() => {
    mockLogger.info.resetHistory();
    mockLogger.error.resetHistory();
    mockLogger.warn.resetHistory();
    mockLogger.debug.resetHistory();
    mockDb.query.resetHistory();
  });

  describe('#findByFacebookId', () => {
    describe('driver found', () => {
      before(() => {
        mockDb.query.resolves({ rows:
            [{ driver_id: 123, facebook_id: 'id', driver_state: 'AVAILABLE'} ] } );
      });

      it('returns driver', async () => {
        let driver = await driverModel.findByFacebookId('id');
        expect(driver).to.be.ok();
        expect(driver.driver_id).to.be(123);
        expect(driver.facebook_id).to.be('id');
        expect(driver.driver_state).to.be('AVAILABLE');
      });

      it('logs success', async () => {
        await driverModel.findByFacebookId('id');
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Driver with facebook_id:\'%s\' found');
        expect(mockLogger.info.getCall(0).args[1]).to.be('id');
      });
    });

    describe('driver not found', () => {
      before(() => {
        mockDb.query.resolves({ rows: [] } );
      });

      it('returns null', async () => {
        let driver = await driverModel.findByFacebookId('id');
        expect(driver).to.be.null;
      });

      it('logs driver not found', async () => {
        await driverModel.findByFacebookId('id');
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Driver with facebook_id:\'%s\' not found');
        expect(mockLogger.info.getCall(0).args[1]).to.be('id');
      });
    });

    describe('db error', () => {
      before(() => {
        mockDb.query.rejects(new Error('DB error'));
      });

      it('returns error', async () => {
        let functionSpy = sinon.spy(driverModel.findByFacebookId);
        try {
          await functionSpy('id');
          throw new Error('Exception was not thrown');
        } catch (err) { }
        expect(functionSpy.threw(new Error('DB error')));
      });

      it('logs db failure', async () => {
        try {
          await driverModel.findByFacebookId('id');
        } catch (err) { }
        expect(mockLogger.error.calledTwice);
        expect(mockLogger.error.getCall(0).args[0]).to.be('DB error: %j');
        expect(mockLogger.error.getCall(0).args[1]).to.be('DB error');
        expect(mockLogger.error.getCall(1).args[0]).to.be('Error looking for facebook_id:\'%s\' in the database');
        expect(mockLogger.error.getCall(1).args[1]).to.be('id');
      });
    });
  });

  describe('#create', () => {
    let mockDriver = {
      facebook_id: 'id'
    };

    let mockDbDriver = {
      facebook_id: 'id',
      driver_id: 123,
      driver_state: 'AVAILABLE',
    };

    describe('insert success', () => {
      before(() => {
        mockDb.query.onFirstCall().resolves({ rows: [mockDbDriver] });
      });

      it('passes correct values to insert query', async () => {
        await driverModel.create(mockDriver);
        expect(mockDb.query.getCall(0).args[1]).to.eql(['id']);
      });

      it('returns updated driver', async () => {
        let driver = await driverModel.create(mockDriver);
        expect(driver.driver_id).to.be(123);
        expect(driver.facebook_id).to.be('id');
        expect(driver.driver_state).to.be('AVAILABLE');
      });
    });

    describe('insert failure', () => {
      before(() => {
        mockDb.query.onFirstCall().rejects(new Error('db error on insert'));
      });

      it('passes correct values to insert query', async () => {
        try {
          await driverModel.create(mockDriver);
        } catch (err) { }
        expect(mockDb.query.calledOnce);
        expect(mockDb.query.getCall(0).args[1]).to.eql(['id']);
      });

      it('returns error', async function() {
        let err;
        try {
          await driverModel.create(mockDriver);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('db error on insert');
      });
    });
  });
});
