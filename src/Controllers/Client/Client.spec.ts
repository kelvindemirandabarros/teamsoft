import request from 'supertest';

import app from '../../server';
import Db from '../../database';
import Client from '../../models/Client';

describe('Testes para o model Client.', () => {
  beforeEach(async () => {
    await Db.connect();

    await Client.deleteMany({});

    await Db.disconnect();
  });

  afterAll(async () => {
    await Db.connect();

    await Client.deleteMany({});

    await Db.disconnect();
  });

  describe('Testes para a adição de um Cliente.', () => {
    it('1. Não deve criar um Cliente se algum dos campos estiver vazio.', async () => {
      const newClient = {};

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Não foi possível adicionar o Cliente.'
      );

      expect(response.body.details[0].field).toBe('cnpj');
      expect(response.body.details[0].error).toBe(
        `O campo 'cnpj' é obrigatório.`
      );

      expect(response.body.details[1].field).toBe('razaoSocial');
      expect(response.body.details[1].error).toBe(
        `O campo 'razaoSocial' é obrigatório.`
      );

      expect(response.body.details[2].field).toBe('nomeContato');
      expect(response.body.details[2].error).toBe(
        `O campo 'nomeContato' é obrigatório.`
      );

      expect(response.body.details[3].field).toBe('telefone');
      expect(response.body.details[3].error).toBe(
        `O campo 'telefone' é obrigatório.`
      );
    });

    it('2. Não deve criar um Cliente se algum dos campos tiver informações fora do padrão permitido.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-5', // Fora do padrão Xx.XxX.xXx/XxXx-Xx
        razaoSocial: 'K', // Deve ter no mínimo 2 caracteres.
        nomeContato: 'L', // Deve ter no mínimo 2 caracteres.
        telefone: '(19) 2113-825', // Fora do padrões (DDD) XxXx-XxXx e (DDD) 9XxXx-XxXx
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Não foi possível adicionar o Cliente.'
      );

      expect(response.body.details[0].field).toBe('cnpj');
      expect(response.body.details[0].error).toBe(
        `O campo 'cnpj' deve estar no formato Xx.XxX.xXx/XxXx-Xx`
      );

      expect(response.body.details[1].field).toBe('razaoSocial');
      expect(response.body.details[1].error).toBe(
        `O campo 'razaoSocial' deve conter no mínimo ${2} caracteres.`
      );

      expect(response.body.details[2].field).toBe('nomeContato');
      expect(response.body.details[2].error).toBe(
        `O campo 'nomeContato' deve conter no mínimo ${2} caracteres.`
      );

      expect(response.body.details[3].field).toBe('telefone');
      expect(response.body.details[3].error).toBe(
        `O campo 'telefone' deve estar no formato (DDD) XxXx-XxXx para telefones fixos ou (DDD) 9XxXx-XxXx para celulares.`
      );
    });

    it('3. Não deve criar um Cliente se algum dos campos tiver o formato diferente de String.', async () => {
      const newClient = {
        cnpj: 5570714000159, // Não é string.
        razaoSocial: 12345, // Não é string.
        nomeContato: 12345, // Não é string.
        telefone: 1921138250, // Não é string.
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Não foi possível adicionar o Cliente.'
      );

      expect(response.body.details[0].field).toBe('cnpj');
      expect(response.body.details[0].error).toBe(
        `O campo 'cnpj' deve ser string.`
      );

      expect(response.body.details[1].field).toBe('razaoSocial');
      expect(response.body.details[1].error).toBe(
        `O campo 'razaoSocial' deve ser string.`
      );

      expect(response.body.details[2].field).toBe('nomeContato');
      expect(response.body.details[2].error).toBe(
        `O campo 'nomeContato' deve ser string.`
      );

      expect(response.body.details[3].field).toBe('telefone');
      expect(response.body.details[3].error).toBe(
        `O campo 'telefone' deve ser string.`
      );
    });

    it('4. Deve criar um Cliente que tiver todas as informações nos padrões corretos.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');
    });

    it('5. Não deve criar um Cliente com um CNPJ já cadastrado.', async () => {
      const newClient = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response = await request(app).post('/clients').send(newClient);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Cliente criado com sucesso.');

      const newClient2 = {
        cnpj: '05.570.714/0001-59',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A.',
        nomeContato: 'Leandro Camargo Ramos',
        telefone: '(19) 2113-8250',
      };

      const response2 = await request(app).post('/clients').send(newClient2);

      expect(response2.status).toBe(400);
      expect(response2.body.message).toBe('Este CNPJ já foi cadastrado.');
    });
  });

  describe('Testes para a requisição de todos os Clientes.', () => {
    it('6. Deve ler os clientes cadastrados com suas informações.', async () => {
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
      expect(response2.body.clients[0]).toHaveProperty('cnpj');
      expect(response2.body.clients[0].cnpj).toBe(newClient.cnpj);
      expect(response2.body.clients[0]).toHaveProperty('razaoSocial');
      expect(response2.body.clients[0].razaoSocial).toBe(newClient.razaoSocial);
      expect(response2.body.clients[0]).toHaveProperty('nomeContato');
      expect(response2.body.clients[0].nomeContato).toBe(newClient.nomeContato);
      expect(response2.body.clients[0]).toHaveProperty('telefone');
      expect(response2.body.clients[0].telefone).toBe(newClient.telefone);
      expect(response2.body.clients[0]).toHaveProperty('createdAt');
      expect(response2.body.clients[0]).toHaveProperty('updatedAt');
      expect(response2.body.clients[0]).toHaveProperty('__v');
    });
  });

  describe('Testes para a requisição de um Cliente específico com o ID.', () => {
    it('7. Não deve receber as informações de um cliente específico com um ID inválido.', async () => {
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

      // O 'X' invalida o formato do ID do MongoDB!
      const response3 = await request(app).get(
        `/clients/${response2.body.clients[0]._id}X`
      );

      expect(response3.status).toBe(400);
      expect(response3.body.message).toBe('Este ID de Cliente não é válido.');
    });

    it('8. Não deve receber as informações de um cliente específico com um ID não cadastrado.', async () => {
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

      // O ID é válido mas não deve estar cadastrado!
      const response3 = await request(app).get(
        `/clients/6213b0995567093a2bee4cff`
      );

      expect(response3.status).toBe(400);
      expect(response3.body.message).toBe('Este Cliente não foi encontrado.');
    });

    it('9. Deve receber as informações de um cliente específico com um ID válido e cadastrado.', async () => {
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

      const response3 = await request(app).get(
        `/clients/${response2.body.clients[0]._id}`
      );

      expect(response3.status).toBe(200);
      expect(response3.body).toHaveProperty('_id');
      expect(response3.body).toHaveProperty('cnpj');
      expect(response3.body.cnpj).toBe(newClient.cnpj);
      expect(response3.body).toHaveProperty('razaoSocial');
      expect(response3.body.razaoSocial).toBe(newClient.razaoSocial);
      expect(response3.body).toHaveProperty('nomeContato');
      expect(response3.body.nomeContato).toBe(newClient.nomeContato);
      expect(response3.body).toHaveProperty('telefone');
      expect(response3.body.telefone).toBe(newClient.telefone);
      expect(response3.body).toHaveProperty('createdAt');
      expect(response3.body).toHaveProperty('updatedAt');
      expect(response3.body).toHaveProperty('__v');
    });
  });

  describe('Testes para a atualização de um Cliente.', () => {
    it('10. Não deve atualizar um Cliente com um ID inválido.', async () => {
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

      const infoToUpdate = {};

      const response3 = await request(app)
        .put(`/clients/${response2.body.clients[0]._id}X`)
        .send(infoToUpdate);

      expect(response3.status).toBe(400);
      expect(response3.body.message).toBe('Este ID de Cliente não é válido.');
    });

    it('11. Não deve atualizar um Cliente sem nenhum campo a ser atualizado.', async () => {
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

      const infoToUpdate = {};

      const response3 = await request(app)
        .put(`/clients/${response2.body.clients[0]._id}`)
        .send(infoToUpdate);

      expect(response3.status).toBe(400);
      expect(response3.body.message).toBe(
        'Não foi possível atualizar o Cliente.'
      );
      expect(response3.body.details[0].field).toBe('Requisição');
      expect(response3.body.details[0].error).toBe(
        `Pelo menos um dos campos 'cnpj', 'razaoSocial', 'nomeContato' ou 'telefone' deve conter uma informação nova.`
      );
    });

    it('12. Não deve atualizar um Cliente com um ID não cadastrado.', async () => {
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

      const infoToUpdate = {
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A. ATUALIZADO',
      };

      // O ID é válido mas não deve estar cadastrado.
      const response3 = await request(app)
        .put(`/clients/6213b0995567093a2bee4cff`)
        .send(infoToUpdate);

      expect(response3.status).toBe(400);
      expect(response3.body.message).toBe('Este Cliente não foi encontrado.');
    });

    it('13. Deve atualizar um Cliente com um ID cadastrado e algum campo para atualizar.', async () => {
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

      const infoToUpdate = {
        cnpj: '05.570.714/0001-58',
        razaoSocial: 'KABUM COMERCIO ELETRONICO S.A. ATUALIZADO',
        nomeContato: 'Thiago Camargo Ramos',
        telefone: '(19) 2113-8251',
      };

      // O ID é válido mas não deve estar cadastrado.
      const response3 = await request(app)
        .put(`/clients/${response2.body.clients[0]._id}`)
        .send(infoToUpdate);

      expect(response3.status).toBe(200);
      expect(response3.body.message).toBe(
        'O Cliente foi atualizado com sucesso.'
      );
    });
  });

  describe('Testes para', () => {
    it('14. Não deve excluir um cliente específico com um ID inválido.', async () => {
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

      // O 'X' invalida o formato do ID do MongoDB!
      const response3 = await request(app).delete(
        `/clients/${response2.body.clients[0]._id}X`
      );

      expect(response3.status).toBe(400);
      expect(response3.body.message).toBe('Este ID de Cliente não é válido.');
    });

    it('15. Não deve excluir um cliente específico com um ID não cadastrado.', async () => {
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

      // O ID é válido mas não deve estar cadastrado!
      const response3 = await request(app).delete(
        `/clients/6213b0995567093a2bee4cff`
      );

      expect(response3.status).toBe(400);
      expect(response3.body.message).toBe('Este Cliente não foi encontrado.');
    });

    it('16. Deve excluir um cliente específico com um ID cadastrado.', async () => {
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

      const response3 = await request(app).delete(
        `/clients/${response2.body.clients[0]._id}`
      );

      expect(response3.status).toBe(200);
      expect(response3.body.message).toBe(
        'O Cliente foi excluído com sucesso.'
      );
    });
  });
});
