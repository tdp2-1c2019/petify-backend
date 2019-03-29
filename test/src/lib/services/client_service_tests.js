const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const BaseHttpError = require('../../../../src/errors/base_http_error.js');
const ClientServiceModule = '../../../../src/lib/services/client_service.js';

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
};

const mockClientModel = {
  findByFacebookId: sinon.stub(),
  create: sinon.stub(),
};

function setupClientService() {
  let mocks = {
    '../../models/client_model.js': function() {
 return mockClientModel;
},
  };
  let ClientService = proxyquire(ClientServiceModule, mocks);
  return new ClientService(mockLogger);
}


describe('ClientService Tests', () => {
  let clientService;

  before(() => {
    clientService = setupClientService();
  });

  describe('#createClient', () => {
    let mockBody = {
      facebook_id: 'facebook_id',
      facebook_token: 'token',
      birth_date: '1999-09-09',
      full_address: 'address',
      full_name: 'John Doe',
      phone_number: '123456789',
    };

    describe('create success', () => {
      before(() => {
        mockClientModel.create.resolves({ client_id: 1, facebook_id: 'facebook_id', facebook_token: 'token', client_state: 'ACTIVE', birth_date: '1999-09-09',
          full_address: 'address', full_name: 'John Doe', phone_number: '123456789' });
      });

      it('returns client', async () => {
        let client = await clientService.createClient(mockBody);
        expect(client).to.be.ok();
        expect(client.client_id).to.be(1);
        expect(client.facebook_id).to.be('facebook_id');
        expect(client.facebook_token).to.be('token');
        expect(client.client_state).to.be('ACTIVE');
        expect(client.birth_date).to.be('1999-09-09');
        expect(client.full_address).to.be('address');
        expect(client.full_name).to.be('John Doe');
        expect(client.phone_number).to.be('123456789');
      });
    });

    describe('create failure', () => {
      before(() => {
        mockClientModel.create.rejects(new Error('Creation error'));
      });

      describe('client found', () => {
        before(() => {
          mockClientModel.findByFacebookId.resolves({ client_id: 1, facebook_id: 'facebook_id', facebook_token: 'token', client_state: 'ACTIVE', birth_date: '1999-09-09',
            full_address: 'address', full_name: 'John Doe', phone_number: '123456789' });
        });

        it('returns error', async () => {
          let err;
          try {
            await clientService.createClient(mockBody);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.a(BaseHttpError);
          expect(err.statusCode).to.be(409);
          expect(err.message).to.be('Facebook Id already exists');
        });
      });

      describe('client not found', () => {
        before(() => {
          mockClientModel.findByFacebookId.rejects(new Error('client not found'));
        });

        it('returns error', async () => {
          let err;
          try {
            await clientService.createClient(mockBody);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err).to.be.a(BaseHttpError);
          expect(err.statusCode).to.be(500);
          expect(err.message).to.be('Client creation error');
        });
      });
    });
  });
});
