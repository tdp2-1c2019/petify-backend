const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const ClientControllerModule = '../../../src/controllers/client_controller.js';

let mockClientService = {
  createClient: sinon.stub(),
  findClient: sinon.stub(),
};

let mockLogger = {
  error: sinon.stub(),
};

function setupClientController() {
  let mocks = {
    '../lib/services/client_service.js': function() {
 return mockClientService;
},
  };
  let ClientController = proxyquire(ClientControllerModule, mocks);
  return new ClientController(mockLogger);
}

describe('ClientController Tests', () => {
  let clientController;

  before(() => {
    clientController = setupClientController();
  });

  beforeEach(() => {
    mockClientService.createClient.resetHistory();
  });

  describe('#createClient', () => {
    let mockClientRequest = {
      body: {
        facebook_id: 'id',
        birth_date: '1999-09-09',
        full_address: 'address',
        full_name: 'John Doe',
        phone_number: '123456789',
      },
    };

    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockClientService.createClient.resolves( { client_id: 1, facebook_id: 'facebook_id', client_state: 'ACTIVE', birth_date: '1999-09-09',
          full_address: 'address', full_name: 'John Doe', phone_number: '123456789' });
      });

      it('calls client service', async () => {
        await clientController.createClient(mockClientRequest, mockResponse, function() {});
        expect(mockClientService.createClient.calledOnce);
      });

      it('passes correct params to client service', async () => {
        await clientController.createClient(mockClientRequest, mockResponse, function() {});
        expect(mockClientService.createClient.getCall(0).args[0]).to.be.eql(mockClientRequest.body);
      });

      it('saves client in response', async () => {
        await clientController.createClient(mockClientRequest, mockResponse, function() {});
        expect(mockResponse.client).to.be.ok();
        expect(mockResponse.client.client_id).to.be(1);
        expect(mockResponse.client.facebook_id).to.be('facebook_id');
        expect(mockResponse.client.client_state).to.be('ACTIVE');
        expect(mockResponse.client.birth_date).to.be('1999-09-09');
        expect(mockResponse.client.full_address).to.be('address');
        expect(mockResponse.client.full_name).to.be('John Doe');
        expect(mockResponse.client.phone_number).to.be('123456789');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await clientController.createClient(mockClientRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockClientService.createClient.rejects(new Error('creation error'));
      });

      it('calls client service', async () => {
        await clientController.createClient(mockClientRequest, mockResponse, function() {});
        expect(mockClientService.createClient.calledOnce);
      });

      it('passes correct params to client service', async () => {
        await clientController.createClient(mockClientRequest, mockResponse, function() {});
        expect(mockClientService.createClient.getCall(0).args[0]).to.be.eql(mockClientRequest.body);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await clientController.createClient(mockClientRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('creation error')));
      });
    });
  });

  describe('#findClient', () => {
    let mockClientRequest = {
      query: {
        facebook_id: 1,
      },
    };

    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockClientService.findClient.resolves({ client_id: 1, facebook_id: 'facebook_id', client_state: 'ACTIVE', birth_date: '1999-09-09',
          full_address: 'address', full_name: 'John Doe', phone_number: '123456789' });
      });

      it('calls client service', async () => {
        await clientController.findClient(mockClientRequest, mockResponse, function() {});
        expect(mockClientService.findClient.calledOnce);
      });

      it('passes correct params to client service', async () => {
        await clientController.findClient(mockClientRequest, mockResponse, function() {});
        expect(mockClientService.findClient.getCall(0).args[0]).to.be.eql(1);
      });

      it('saves client in response', async () => {
        await clientController.findClient(mockClientRequest, mockResponse, function() {});
        expect(mockResponse.client).to.be.ok();
        expect(mockResponse.client.client_id).to.be(1);
        expect(mockResponse.client.facebook_id).to.be('facebook_id');
        expect(mockResponse.client.client_state).to.be('ACTIVE');
        expect(mockResponse.client.birth_date).to.be('1999-09-09');
        expect(mockResponse.client.full_address).to.be('address');
        expect(mockResponse.client.full_name).to.be('John Doe');
        expect(mockResponse.client.phone_number).to.be('123456789');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await clientController.findClient(mockClientRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockClientService.findClient.rejects(new Error('find error'));
      });

      it('calls client service', async () => {
        await clientController.findClient(mockClientRequest, mockResponse, function() {});
        expect(mockClientService.findClient.calledOnce);
      });

      it('passes correct params to client service', async () => {
        await clientController.findClient(mockClientRequest, mockResponse, function() {});
        expect(mockClientService.findClient.getCall(0).args[0]).to.be.eql(1);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await clientController.findClient(mockClientRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('find error')));
      });
    });
  });
});
