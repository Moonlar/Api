import supertest from 'supertest';
import { matchers } from 'jest-json-schema';

import app from '../../src/App';
import { runMigrations, runSeeds } from '../../src/database/Connection';
import { createDefaultUsers } from '../utils/data';

expect.extend(matchers);

const request = supertest(app);

describe('App Routes', () => {
  const userAgent = supertest.agent(app);
  const adminAgent = supertest.agent(app);
  const managerAgent = supertest.agent(app);

  beforeAll(async () => {
    // await runMigrations();
    // await runSeeds();
    // await createDefaultUsers();
    //
    // await userAgent.get('/test/token/user');
    // await adminAgent.get('/test/token/admin');
    // await managerAgent.get('/test/token/manager');
  });

  describe('GET /', () => {
    it('Deve retornar dados válidos', async () => {
      const response = await request.get('/');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('environment', 'test');
    });
  });
});
