const expect = require('expect.js');
const sinon = require('sinon');
const ClientModel = require('../../../src/models/client_model.js');

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

function createClientModel() {
  mockDb.release.returns();
  return new ClientModel(mockLogger, mockPool);
}

const clientModel = createClientModel();

describe('ClientModel Tests', () => {
  beforeEach(() => {
    mockLogger.info.resetHistory();
    mockLogger.error.resetHistory();
    mockLogger.warn.resetHistory();
    mockLogger.debug.resetHistory();
    mockDb.query.resetHistory();
  });

  describe('#findByFacebookId', () => {
    describe('client found', () => {
      before(() => {
        mockDb.query.resolves({ rows:
            [{ client_id: 123, facebook_id: 'id', client_state: 'ACTIVE', birth_date: '1999-09-09',
            full_address: 'address', full_name: 'John Doe', phone_number: '123456789'}] });
      });

      it('returns client', async () => {
        let client = await clientModel.findByFacebookId('id');
        expect(client).to.be.ok();
        expect(client.client_id).to.be(123);
        expect(client.facebook_id).to.be('id');
        expect(client.client_state).to.be('ACTIVE');
        expect(client.birth_date).to.be('1999-09-09');
        expect(client.full_address).to.be('address');
        expect(client.full_name).to.be('John Doe');
        expect(client.phone_number).to.be('123456789');
      });

      it('logs success', async () => {
        await clientModel.findByFacebookId('id');
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Client with facebook_id:\'%s\' found');
        expect(mockLogger.info.getCall(0).args[1]).to.be('id');
      });
    });

    describe('client not found', () => {
      before(() => {
        mockDb.query.resolves({ rows: [] } );
      });

      it('returns null', async () => {
        let client = await clientModel.findByFacebookId('id');
        expect(client).to.be.null;
      });

      it('logs client not found', async () => {
        await clientModel.findByFacebookId('id');
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Client with facebook_id:\'%s\' not found');
        expect(mockLogger.info.getCall(0).args[1]).to.be('id');
      });
    });

    describe('db error', () => {
      before(() => {
        mockDb.query.rejects(new Error('DB error'));
      });

      it('returns error', async () => {
        let functionSpy = sinon.spy(clientModel.findByFacebookId);
        try {
          await functionSpy('id');
          throw new Error('Exception was not thrown');
        } catch (err) { }
        expect(functionSpy.threw(new Error('DB error')));
      });

      it('logs db failure', async () => {
        try {
          await clientModel.findByFacebookId('id');
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
    let mockClient = {
      facebook_id: 'id',
      birth_date: '1999-09-09',
      full_address: 'address',
      full_name: 'John Doe',
      phone_number: '123456789',
    };

    let mockDbClient = {
      facebook_id: 'id',
      client_id: 123,
      client_state: 'ACTIVE',
      birth_date: '1999-09-09',
      full_address: 'address',
      full_name: 'John Doe',
      phone_number: '123456789',
    };

    describe('insert success', () => {
      before(() => {
        mockDb.query.onFirstCall().resolves({ rows: [mockDbClient] });
      });

      it('passes correct values to insert query', async () => {
        await clientModel.create(mockClient);
        expect(mockDb.query.getCall(0).args[1]).to.eql(['id', '1999-09-09', 'address', 'John Doe', '123456789']);
      });

      it('returns updated client', async () => {
        let client = await clientModel.create(mockClient);
        expect(client.client_id).to.be(123);
        expect(client.facebook_id).to.be('id');
        expect(client.client_state).to.be('ACTIVE');
        expect(client.birth_date).to.be('1999-09-09');
        expect(client.full_address).to.be('address');
        expect(client.full_name).to.be('John Doe');
        expect(client.phone_number).to.be('123456789');
      });
    });

    describe('insert failure', () => {
      before(() => {
        mockDb.query.onFirstCall().rejects(new Error('db error on insert'));
      });

      it('passes correct values to insert query', async () => {
        try {
          await clientModel.create(mockClient);
        } catch (err) { }
        expect(mockDb.query.calledOnce);
        expect(mockDb.query.getCall(0).args[1]).to.eql(['id', '1999-09-09', 'address', 'John Doe', '123456789']);
      });

      it('returns error', async function() {
        let err;
        try {
          await clientModel.create(mockClient);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('db error on insert');
      });
    });
  });
});
