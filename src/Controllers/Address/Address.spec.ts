import request from 'supertest';

import app from '../../server';
import Db from '../../database';
import Client from '../../models/Client';
import Address from '../../models/Address';

describe('Testes para o model Address.', () => {
  beforeEach(async () => {
    await Db.connect();

    await Client.deleteMany({});
    await Address.deleteMany({});

    await Db.disconnect();
  });

  afterAll(async () => {
    await Db.connect();

    await Client.deleteMany({});
    await Address.deleteMany({});

    await Db.disconnect();
  });

  describe('Testes para a adição de um Endereço.', () => {
    it('1. Não deve adicionar um Endereço de Cliente se o ID do Cliente for inválido.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id + 'X', // O 'X' invalida o formato do ID do MongoDB!
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(400);
      expect(response3.body.message).toBe('Este ID de Cliente não é válido.');
    });

    it('2. Não deve adicionar um Endereço de Cliente se algum dos campos obrigatórios estiver vazio.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body).toHaveProperty('clients');
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id,
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(400);
      expect(response3.body.message).toBe(
        'Não foi possível adicionar o Endereço do Cliente.'
      );
      expect(response3.body).toHaveProperty('details');
      expect(response3.body.details.length).toBe(6);

      expect(response3.body.details[0].field).toBe('logradouro');
      expect(response3.body.details[0].error).toBe(
        `O campo 'logradouro' é obrigatório.`
      );

      expect(response3.body.details[1].field).toBe('numero');
      expect(response3.body.details[1].error).toBe(
        `O campo 'numero' é obrigatório.`
      );

      expect(response3.body.details[2].field).toBe('bairro');
      expect(response3.body.details[2].error).toBe(
        `O campo 'bairro' é obrigatório.`
      );

      expect(response3.body.details[3].field).toBe('cidade');
      expect(response3.body.details[3].error).toBe(
        `O campo 'cidade' é obrigatório.`
      );

      expect(response3.body.details[4].field).toBe('estado');
      expect(response3.body.details[4].error).toBe(
        `O campo 'estado' é obrigatório.`
      );

      expect(response3.body.details[5].field).toBe('cep');
      expect(response3.body.details[5].error).toBe(
        `O campo 'cep' é obrigatório.`
      );
    });

    it('3. Não deve adicionar um Endereço de Cliente se algum dos campos não for uma String.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id,
        logradouro: 1243,
        numero: 1321,
        complemento: 11342,
        bairro: 11342,
        cidade: 4132,
        estado: 5142,
        cep: 13480010,
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(400);
      expect(response3.body.message).toBe(
        'Não foi possível adicionar o Endereço do Cliente.'
      );

      expect(response3.body.details[0].field).toBe('logradouro');
      expect(response3.body.details[0].error).toBe(
        `O campo 'logradouro' deve ser string.`
      );

      expect(response3.body.details[1].field).toBe('numero');
      expect(response3.body.details[1].error).toBe(
        `O campo 'numero' deve ser string.`
      );

      expect(response3.body.details[2].field).toBe('complemento');
      expect(response3.body.details[2].error).toBe(
        `O campo 'complemento' deve ser string.`
      );

      expect(response3.body.details[3].field).toBe('bairro');
      expect(response3.body.details[3].error).toBe(
        `O campo 'bairro' deve ser string.`
      );

      expect(response3.body.details[4].field).toBe('cidade');
      expect(response3.body.details[4].error).toBe(
        `O campo 'cidade' deve ser string.`
      );

      expect(response3.body.details[5].field).toBe('estado');
      expect(response3.body.details[5].error).toBe(
        `O campo 'estado' deve ser string.`
      );

      expect(response3.body.details[6].field).toBe('cep');
      expect(response3.body.details[6].error).toBe(
        `O campo 'cep' deve ser string.`
      );
    });

    it('4. Não deve adicionar um Endereço de Cliente se algum dos campos não for válido.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id,
        logradouro: 'Rua ',
        numero: '',
        complemento: '9°',
        bairro: 'Ce',
        cidade: 'Li',
        estado: 'S',
        cep: '13480-01',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(400);
      expect(response3.body.message).toBe(
        'Não foi possível adicionar o Endereço do Cliente.'
      );

      expect(response3.body.details[0].field).toBe('logradouro');
      expect(response3.body.details[0].error).toBe(
        `O campo 'logradouro' deve conter no mínimo ${5} caracteres.`
      );

      expect(response3.body.details[1].field).toBe('numero');
      expect(response3.body.details[1].error).toBe(
        `O campo 'numero' deve conter no mínimo ${1} caracteres.`
      );

      expect(response3.body.details[2].field).toBe('complemento');
      expect(response3.body.details[2].error).toBe(
        `O campo 'complemento' deve conter no mínimo ${3} caracteres.`
      );

      expect(response3.body.details[3].field).toBe('bairro');
      expect(response3.body.details[3].error).toBe(
        `O campo 'bairro' deve conter no mínimo ${3} caracteres.`
      );

      expect(response3.body.details[4].field).toBe('cidade');
      expect(response3.body.details[4].error).toBe(
        `O campo 'cidade' deve conter no mínimo ${3} caracteres.`
      );

      expect(response3.body.details[5].field).toBe('estado');
      expect(response3.body.details[5].error).toBe(
        `O campo 'estado' deve conter no mínimo ${2} caracteres.`
      );

      expect(response3.body.details[6].field).toBe('cep');
      expect(response3.body.details[6].error).toBe(
        `O campo 'cep' deve estar no formato XxXxX-xXx`
      );
    });

    it('5. Não deve adicionar um Endereço de Cliente com um ID de cliente válido mas que não está cadastrado.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: '6213b0995567093a2bee4cff',
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(400);
      expect(response3.body.message).toBe('Este Cliente não foi encontrado.');
    });

    it('6. Deve adicionar um Endereço de Cliente com um ID de cliente válido e cadastrado, e com as informações do endereço válidas.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id,
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );
    });
  });

  describe('Testes para a requisição de todos os Endereços.', () => {
    it('7. Deve receber todos os Endereços cadastrados com suas informações.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id,
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );

      const response4 = await request(app).get('/addresses');

      expect(response4.status).toBe(200);
      expect(response4.body.addresses.length).toBe(1);

      expect(response4.body.addresses[0]).toHaveProperty('_id');
      expect(response4.body.addresses[0]).toHaveProperty('clientId');
      expect(response4.body.addresses[0]).toHaveProperty('logradouro');
      expect(response4.body.addresses[0].logradouro).toBe(
        newAddress.logradouro
      );
      expect(response4.body.addresses[0]).toHaveProperty('numero');
      expect(response4.body.addresses[0].numero).toBe(newAddress.numero);
      expect(response4.body.addresses[0]).toHaveProperty('complemento');
      expect(response4.body.addresses[0].complemento).toBe(
        newAddress.complemento
      );
      expect(response4.body.addresses[0]).toHaveProperty('bairro');
      expect(response4.body.addresses[0].bairro).toBe(newAddress.bairro);
      expect(response4.body.addresses[0]).toHaveProperty('cidade');
      expect(response4.body.addresses[0].cidade).toBe(newAddress.cidade);
      expect(response4.body.addresses[0]).toHaveProperty('estado');
      expect(response4.body.addresses[0].estado).toBe(newAddress.estado);
      expect(response4.body.addresses[0]).toHaveProperty('cep');
      expect(response4.body.addresses[0].cep).toBe(newAddress.cep);
      expect(response4.body.addresses[0]).toHaveProperty('createdAt');
      expect(response4.body.addresses[0]).toHaveProperty('updatedAt');
      expect(response4.body.addresses[0]).toHaveProperty('__v');
    });
  });

  describe('Testes para a requisição de um Endereço específico.', () => {
    it('8. Não deve receber um Endereço com um ID inválido.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id,
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );

      const response4 = await request(app).get(`/addresses`);

      expect(response4.status).toBe(200);
      expect(response4.body).toHaveProperty('addresses');
      expect(response4.body.addresses.length).toBe(1);

      // O 'X' invalida o ID.
      const response5 = await request(app).get(
        `/addresses/${response4.body.addresses[0]._id}X`
      );

      expect(response5.status).toBe(400);
      expect(response5.body.message).toBe('Este ID de Endereço não é válido.');
    });

    it('9. Não deve receber um Endereço com um ID válido mas que não está cadastrado.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id,
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );

      const response4 = await request(app).get(`/addresses`);

      expect(response4.status).toBe(200);
      expect(response4.body).toHaveProperty('addresses');
      expect(response4.body.addresses.length).toBe(1);

      // O 'X' invalida o ID.
      const response5 = await request(app).get(
        `/addresses/6213b0995567093a2bee4cff`
      );

      expect(response5.status).toBe(400);
      expect(response5.body.message).toBe('Este Endereço não foi encontrado.');
    });

    it('10. Deve receber um Endereço com um ID válido e cadastrado.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id,
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );

      const response4 = await request(app).get(`/addresses`);

      expect(response4.status).toBe(200);
      expect(response4.body).toHaveProperty('addresses');
      expect(response4.body.addresses.length).toBe(1);

      // O 'X' invalida o ID.
      const response5 = await request(app).get(
        `/addresses/${response4.body.addresses[0]._id}`
      );

      expect(response5.status).toBe(200);

      expect(response5.body).toHaveProperty('_id');
      expect(response5.body).toHaveProperty('clientId');
      expect(response5.body).toHaveProperty('logradouro');
      expect(response5.body.logradouro).toBe(newAddress.logradouro);
      expect(response5.body).toHaveProperty('numero');
      expect(response5.body.numero).toBe(newAddress.numero);
      expect(response5.body).toHaveProperty('complemento');
      expect(response5.body.complemento).toBe(newAddress.complemento);
      expect(response5.body).toHaveProperty('bairro');
      expect(response5.body.bairro).toBe(newAddress.bairro);
      expect(response5.body).toHaveProperty('cidade');
      expect(response5.body.cidade).toBe(newAddress.cidade);
      expect(response5.body).toHaveProperty('estado');
      expect(response5.body.estado).toBe(newAddress.estado);
      expect(response5.body).toHaveProperty('cep');
      expect(response5.body.cep).toBe(newAddress.cep);
      expect(response5.body).toHaveProperty('createdAt');
      expect(response5.body).toHaveProperty('updatedAt');
      expect(response5.body).toHaveProperty('__v');
    });
  });

  describe('Testes para a atualização de um Endereço.', () => {
    it('11. Não deve atualizar um Endereço de Cliente se o ID do Endereço for inválido.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id, // O 'X' invalida o formato do ID do MongoDB!
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );
      expect(response3.body).toHaveProperty('address');

      const updatedAddress = {
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      // O 'X' invalida o ID.
      const response4 = await request(app)
        .put(`/addresses/${response3.body.address._id}X`)
        .send(updatedAddress);

      expect(response4.status).toBe(400);
      expect(response4.body.message).toBe('Este ID de Endereço não é válido.');
    });

    it('12. Não deve atualizar um Endereço de Cliente se algum dos campos não for uma String.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id,
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );
      expect(response3.body).toHaveProperty('address');
      expect(response3.body.address).toHaveProperty('_id');

      const updatedAddress = {
        logradouro: 1234,
        numero: 1234,
        complemento: 1234,
        bairro: 1234,
        cidade: 1234,
        estado: 1234,
        cep: 1234,
      };

      // O 'X' invalida o ID.
      const response4 = await request(app)
        .put(`/addresses/${response3.body.address._id}`)
        .send(updatedAddress);

      expect(response4.status).toBe(400);
      expect(response4.body.message).toBe(
        'Não foi possível atualizar o Endereço do Cliente.'
      );

      expect(response4.body).toHaveProperty('details');
      expect(response4.body.details.length).toBe(7);

      expect(response4.body.details[0].field).toBe('logradouro');
      expect(response4.body.details[0].error).toBe(
        `O campo 'logradouro' deve ser string.`
      );

      expect(response4.body.details[1].field).toBe('numero');
      expect(response4.body.details[1].error).toBe(
        `O campo 'numero' deve ser string.`
      );

      expect(response4.body.details[2].field).toBe('complemento');
      expect(response4.body.details[2].error).toBe(
        `O campo 'complemento' deve ser string.`
      );

      expect(response4.body.details[3].field).toBe('bairro');
      expect(response4.body.details[3].error).toBe(
        `O campo 'bairro' deve ser string.`
      );

      expect(response4.body.details[4].field).toBe('cidade');
      expect(response4.body.details[4].error).toBe(
        `O campo 'cidade' deve ser string.`
      );

      expect(response4.body.details[5].field).toBe('estado');
      expect(response4.body.details[5].error).toBe(
        `O campo 'estado' deve ser string.`
      );

      expect(response4.body.details[6].field).toBe('cep');
      expect(response4.body.details[6].error).toBe(
        `O campo 'cep' deve ser string.`
      );
    });

    it('13. Não deve atualizar um Endereço de Cliente se nenhum campo for enviado para atualizar.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id, // O 'X' invalida o formato do ID do MongoDB!
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );
      expect(response3.body).toHaveProperty('address');

      const updatedAddress = {};

      const response4 = await request(app)
        .put(`/addresses/${response3.body.address._id}`)
        .send(updatedAddress);

      expect(response4.status).toBe(400);
      expect(response4.body.message).toBe(
        'Não foi possível atualizar o Endereço do Cliente.'
      );
      expect(response4.body.details[0].field).toBe('Requisição');
      expect(response4.body.details[0].error).toBe(
        `Pelo menos um dos campos 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado' ou 'cep' deve conter uma informação nova.`
      );
    });

    it('14. Não deve atualizar um Endereço de Cliente com um ID válido mas que não deve estar cadastrado.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id, // O 'X' invalida o formato do ID do MongoDB!
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );
      expect(response3.body).toHaveProperty('address');

      const updatedAddress = {
        numero: '2376',
      };

      const response4 = await request(app)
        .put(`/addresses/6213b0995567093a2bee4cff`)
        .send(updatedAddress);

      expect(response4.status).toBe(400);
      expect(response4.body.message).toBe('Este Endereço não foi encontrado.');
    });

    it('15. Deve atualizar um Endereço de Cliente com um ID válido e cadastrado, e com algum campo para atualizar.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id, // O 'X' invalida o formato do ID do MongoDB!
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );
      expect(response3.body).toHaveProperty('address');

      const updatedAddress = {
        logradouro: 'Rua Carlos Gomes Atualizado',
        numero: '1321-B',
        complemento: '7° andar',
        bairro: 'Central',
        cidade: 'Limeiras',
        estado: 'RJ',
        cep: '21480-010',
      };

      const response4 = await request(app)
        .put(`/addresses/${response3.body.address._id}`)
        .send(updatedAddress);

      expect(response4.status).toBe(200);
      expect(response4.body.message).toBe(
        'O Endereço do Cliente foi atualizado com sucesso.'
      );
    });
  });

  describe('Testes para excluir um cliente específico.', () => {
    it('16. Não deve excluir um Endereço de Cliente com um ID inválido.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id, // O 'X' invalida o formato do ID do MongoDB!
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );
      expect(response3.body).toHaveProperty('address');

      // O 'X' invalida o ID.
      const response4 = await request(app).delete(
        `/addresses/${response3.body.address._id}X`
      );

      expect(response4.status).toBe(400);
      expect(response4.body.message).toBe('Este ID de Endereço não é válido.');
    });

    it('17. Não deve excluir um Endereço de Cliente com um ID válido mas que não deve estar cadastrado.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id, // O 'X' invalida o formato do ID do MongoDB!
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );
      expect(response3.body).toHaveProperty('address');

      // O 'X' invalida o ID.
      const response4 = await request(app).delete(
        `/addresses/6213b0995567093a2bee4cff`
      );

      expect(response4.status).toBe(400);
      expect(response4.body.message).toBe('Este Endereço não foi encontrado.');
    });

    it('18. Deve excluir um Endereço de Cliente com um ID válido mas que não deve estar cadastrado.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const response2 = await request(app).get('/clients');

      expect(response2.status).toBe(200);
      expect(response2.body.clients.length).toBe(1);
      expect(response2.body.clients[0]).toHaveProperty('_id');

      const newAddress = {
        clientId: response2.body.clients[0]._id, // O 'X' invalida o formato do ID do MongoDB!
        logradouro: 'Rua Carlos Gomes',
        numero: '1321',
        complemento: '9° andar',
        bairro: 'Centro',
        cidade: 'Limeira',
        estado: 'SP',
        cep: '13480-010',
      };

      const response3 = await request(app).post(`/addresses`).send(newAddress);

      expect(response3.status).toBe(201);
      expect(response3.body.message).toBe(
        'O Endereço do Cliente foi adicionado com sucesso.'
      );
      expect(response3.body).toHaveProperty('address');

      // O 'X' invalida o ID.
      const response4 = await request(app).delete(
        `/addresses/${response3.body.address._id}`
      );

      expect(response4.status).toBe(200);
      expect(response4.body.message).toBe(
        'O Endereço do Cliente foi excluído com sucesso.'
      );
    });
  });
});
