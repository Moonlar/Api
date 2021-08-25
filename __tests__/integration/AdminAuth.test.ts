import supertest from 'supertest';
import { matchers } from 'jest-json-schema';

import app from '../../src/App';
import { runMigrations, runSeeds } from '../../src/database/Connection';
import { createDefaultUsers } from '../utils/defaultUsers';

expect.extend(matchers);

const request = supertest(app);

describe('Admin Auth Routes', () => {
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

  describe('GET /admin/auth', () => {
    it('Deve retornar que precisa estar conectado', async () => {
      const response = await request.get('/admin/auth');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty(
        'error',
        'You need to be authenticated to access this feature'
      );
    });

    it('(User) Deve retornar dados válidos', async () => {
      const response = await userAgent.get('/admin/auth');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('nickname', 'user');
      expect(response.body).toHaveProperty('permission', 'user');
    });

    it('(Admin) Deve retornar dados válidos', async () => {
      const response = await adminAgent.get('/admin/auth');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('nickname', 'admin');
      expect(response.body).toHaveProperty('permission', 'admin');
    });

    it('(Manager) Deve retornar dados válidos', async () => {
      const response = await managerAgent.get('/admin/auth');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('nickname', 'manager');
      expect(response.body).toHaveProperty('permission', 'manager');
    });
  });
});
