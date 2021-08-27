import supertest from 'supertest';
import { matchers } from 'jest-json-schema';

import app from '../../src/App';
import { runMigrations, runSeeds } from '../../src/database/Connection';
import { serverSchema } from '../utils/schemas';
import { Errors } from '../../src/utils/Response';
import {
  createDefaultServers,
  createDefaultUsers,
  serversData,
} from '../utils/data';

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
      expect(response.body).toHaveProperty('total_servers', 2);
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
      expect(response.body).toHaveProperty('total_servers', 2);
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
      const response = await adminAgent.get(`/server/${serversData[0].id}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toMatchSchema(serverSchema);
    });

    it('(Manager) Deve retornar dados válidos', async () => {
      const response = await managerAgent.get(`/server/${serversData[0].id}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toMatchSchema(serverSchema);
    });
  });
});
