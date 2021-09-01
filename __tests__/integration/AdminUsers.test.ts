import supertest from 'supertest';
import { matchers } from 'jest-json-schema';

import app from '../../src/App';
import { runMigrations, runSeeds } from '../../src/database/Connection';
import { createDefaultUsers } from '../utils/data';
import { Errors } from '../../src/utils/Response';
import { userSchema } from '../utils/schemas';

expect.extend(matchers);

const request = supertest(app);

describe('Admin Users Routes', () => {
  const userAgent = supertest.agent(app);
  const adminAgent = supertest.agent(app);
  const managerAgent = supertest.agent(app);

  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
    await createDefaultUsers();

    await userAgent.get('/test/token/user');
    await adminAgent.get('/test/token/admin');
    await managerAgent.get('/test/token/manager');
  });

  describe('GET /admin/users', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.get('/admin/users');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa ter permissão', async () => {
      const response = await userAgent.get('/admin/users');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa ter permissão', async () => {
      const response = await adminAgent.get('/admin/users');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Deve retornar dados válidos', async () => {
      const response = await managerAgent.get('/admin/users');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_users', 3);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);

      response.body.users.forEach((user: any) => {
        expect(user).toMatchSchema(userSchema);
      });
    });

    it('Deve retornar dados válidos com parâmetros de busca', async () => {
      const response = await managerAgent
        .get('/admin/users')
        .query({ search: 'Man' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_users', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBe(1);
      expect(response.body.users[0]).toMatchSchema(userSchema);
    });

    it('Deve retornar dados válidos com parâmetros de busca inválidos (Invalid page)', async () => {
      const response = await managerAgent
        .get('/admin/users')
        .query({ page: 1000 });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_users', 3);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBe(3);

      response.body.users.forEach((user: any) => {
        expect(user).toMatchSchema(userSchema);
      });
    });

    it('Deve retornar dados válidos com parâmetros de busca inválidos (NaN page)', async () => {
      const response = await managerAgent
        .get('/admin/users')
        .query({ page: 'invalid' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_users', 3);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBe(3);

      response.body.users.forEach((user: any) => {
        expect(user).toMatchSchema(userSchema);
      });
    });
  });

  describe('GET /admin/user/:identifier', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.get('/admin/user/default');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa ter permissão', async () => {
      const response = await userAgent.get('/admin/user/default');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa ter permissão', async () => {
      const response = await adminAgent.get('/admin/user/default');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Usuário não encontrado', async () => {
      const response = await managerAgent.get('/admin/user/not_found');

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Usuário não encontrado (Deleted)', async () => {
      const response = await managerAgent.get('/admin/user/deleted');

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Retorna dados válidos', async () => {
      const response = await managerAgent.get('/admin/user/admin');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toMatchSchema(userSchema);
    });
  });

  describe('GET /admin/user', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.get('/admin/user/default');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(Manager) Retorna dados válidos', async () => {
      const response = await managerAgent.get('/admin/user');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toMatchSchema(userSchema);
    });
  });
});
