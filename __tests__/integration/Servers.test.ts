import { matchers } from 'jest-json-schema';
import supertest from 'supertest';

import app from '../../src/App';
import conn, { runMigrations, runSeeds } from '../../src/database/Connection';
import { Errors, Success } from '../../src/utils/Response';
import { createDefaultServers, createDefaultUsers, serversData } from '../utils/data';
import { serverSchema } from '../utils/schemas';

expect.extend(matchers);

const request = supertest(app);

describe('Server Routes', () => {
  const userAgent = supertest.agent(app);
  const adminAgent = supertest.agent(app);
  const managerAgent = supertest.agent(app);

  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
    await createDefaultUsers();
    await createDefaultServers();

    await userAgent.get('/test/token/user');
    await adminAgent.get('/test/token/admin');
    await managerAgent.get('/test/token/manager');
  });

  describe('GET /servers', () => {
    it('Deve retornar dados válidos', async () => {
      const response = await request.get('/servers');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_servers', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('servers');
      expect(Array.isArray(response.body.servers)).toBe(true);

      response.body.servers.forEach((server: any) => {
        expect(server).toMatchSchema(serverSchema);
        expect(server.deleted_at).toBe(null);
      });
    });

    it('(User) Deve retornar dados válidos', async () => {
      const response = await userAgent.get('/servers');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_servers', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('servers');
      expect(Array.isArray(response.body.servers)).toBe(true);

      response.body.servers.forEach((server: any) => {
        expect(server).toMatchSchema(serverSchema);
        expect(server.deleted_at).toBe(null);
      });
    });

    it('(Admin) Deve retornar dados válidos', async () => {
      const response = await adminAgent.get('/servers');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_servers', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('servers');
      expect(Array.isArray(response.body.servers)).toBe(true);

      response.body.servers.forEach((server: any) => {
        expect(server).toMatchSchema(serverSchema);
      });
    });

    it('(Manager) Deve retornar dados válidos', async () => {
      const response = await managerAgent.get('/servers');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_servers', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('servers');
      expect(Array.isArray(response.body.servers)).toBe(true);

      response.body.servers.forEach((server: any) => {
        expect(server).toMatchSchema(serverSchema);
      });
    });

    it('Deve retornar dados válidos com parâmetros de busca', async () => {
      const response = await request.get('/servers').query({ search: 'Rank' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_servers', 0);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('servers');
      expect(Array.isArray(response.body.servers)).toBe(true);
      expect(response.body.servers.length).toBe(0);
    });

    it('Deve retornar dados válidos com parâmetros de busca inválidos (Invalid page)', async () => {
      const response = await request.get('/servers').query({ page: 1000 });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_servers', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('servers');
      expect(Array.isArray(response.body.servers)).toBe(true);
      expect(response.body.servers.length).toBe(1);

      response.body.servers.forEach((server: any) => {
        expect(server).toMatchSchema(serverSchema);
        expect(server.deleted_at).toBe(null);
      });
    });

    it('Deve retornar dados válidos com parâmetros de busca inválidos (NaN page)', async () => {
      const response = await request.get('/servers').query({ page: 'invalid' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_servers', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('servers');
      expect(Array.isArray(response.body.servers)).toBe(true);
      expect(response.body.servers.length).toBe(1);

      response.body.servers.forEach((server: any) => {
        expect(server).toMatchSchema(serverSchema);
        expect(server.deleted_at).toBe(null);
      });
    });
  });

  describe('GET /server/:id', () => {
    it('Deve retornar dados válidos', async () => {
      const response = await request.get(`/server/${serversData[1].id}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toMatchSchema(serverSchema);
    });

    it('Deve retornar não encontrado com id inválido', async () => {
      const response = await request.get(`/server/invalid`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('Deve retornar não encontrado', async () => {
      const response = await request.get(`/server/${serversData[0].id}`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(User) Deve retornar não encontrado', async () => {
      const response = await userAgent.get(`/server/${serversData[0].id}`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Admin) Deve retornar dados válidos', async () => {
      const response = await adminAgent.get(`/server/${serversData[1].id}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toMatchSchema(serverSchema);
    });

    it('(Manager) Deve retornar dados válidos', async () => {
      const response = await managerAgent.get(`/server/${serversData[1].id}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toMatchSchema(serverSchema);
    });
  });

  describe('POST /server', () => {
    it('Deve estar conectado para criar servidores', async () => {
      const response = await request.post('/server');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Deve retornar que não tem permissão', async () => {
      const response = await userAgent.post('/server');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Deve retornar que não tem permissão', async () => {
      const response = await adminAgent.post('/server');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Deve retornar que dados são inválidos (Sem dados)', async () => {
      const response = await managerAgent.post('/server');

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Deve retornar que dados são inválidos (Sem name)', async () => {
      const response = await managerAgent
        .post('/server')
        .send({ description: 'Valid description' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('(Manager) Deve retornar que dados são inválidos (Sem description)', async () => {
      const response = await managerAgent.post('/server').send({ name: 'Valid name' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('(Manager) Deve retornar que name já existe', async () => {
      const response = await managerAgent
        .post('/server')
        .send({ name: serversData[1].name, description: 'Valid description' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Deve criar server', async () => {
      const response = await managerAgent
        .post('/server')
        .send({ name: 'New server', description: 'Server description' });

      expect(response.statusCode).toBe(201);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.CREATED);

      const isCreated = await conn('servers').select('*').where('identifier', 'new server').first();

      expect(isCreated).toBeTruthy();
    });
  });

  describe('PATCH /server/:id', () => {
    it('Deve estar conectado para atualizar servidores', async () => {
      const response = await request.patch(`/server/${serversData[1].id}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Deve retornar que não tem permissão', async () => {
      const response = await userAgent.patch(`/server/${serversData[1].id}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Deve retornar que não tem permissão', async () => {
      const response = await adminAgent.patch(`/server/${serversData[1].id}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Deve retornar que dados são inválidos (Sem dados)', async () => {
      const response = await managerAgent.patch(`/server/${serversData[1].id}`);

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Deve retornar que dados são inválidos (name inválido)', async () => {
      const response = await managerAgent.patch(`/server/${serversData[1].id}`).send({ name: 'a' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Deve retornar que dados são inválidos (description inválido)', async () => {
      const response = await managerAgent
        .patch(`/server/${serversData[1].id}`)
        .send({ description: 'a' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Deve retornar que não foi encontrado dados para atualizar', async () => {
      const response = await managerAgent
        .patch(`/server/${serversData[0].id}`)
        .send({ name: 'New name', description: 'New description' });

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Deve retornar que name já existe', async () => {
      const response = await managerAgent
        .patch(`/server/${serversData[1].id}`)
        .send({ name: serversData[1].name, description: 'Valid description' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Deve atualizar server', async () => {
      const response = await managerAgent
        .patch(`/server/${serversData[1].id}`)
        .send({ name: 'Updated', description: 'Updated server' });

      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.UPDATED);

      const isUpdated = await conn('servers').select('*').where('identifier', 'updated').first();

      expect(isUpdated).toBeTruthy();
    });
  });

  describe('DELETE /server/:id', () => {
    it('Deve estar conectado para remover servidores', async () => {
      const response = await request.delete(`/server/${serversData[1].id}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Deve ter permissão para isso', async () => {
      const response = await userAgent.delete(`/server/${serversData[1].id}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Deve ter permissão para isso', async () => {
      const response = await adminAgent.delete(`/server/${serversData[1].id}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Deve retornar que servidor não foi encontrado', async () => {
      const response = await managerAgent.delete(`/server/${serversData[0].id}`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Deve remover servidor', async () => {
      const response = await managerAgent.delete(`/server/${serversData[1].id}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.DELETED);

      const wasDeleted = await conn('servers')
        .select('id')
        .where('id', serversData[1].id)
        .where('deleted_at', null)
        .first();

      expect(wasDeleted).toBeFalsy();
    });
  });
});
