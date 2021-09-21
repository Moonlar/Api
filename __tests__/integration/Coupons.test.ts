import { matchers } from 'jest-json-schema';
import supertest from 'supertest';

import app from '../../src/App';
import { runMigrations, runSeeds } from '../../src/database/Connection';
import { Errors } from '../../src/utils/Response';
// import {  } from '../utils/data';

expect.extend(matchers);

const request = supertest(app);

describe('Coupons Routes', () => {
  const userAgent = supertest.agent(app);
  const adminAgent = supertest.agent(app);
  const managerAgent = supertest.agent(app);

  beforeAll(async () => {
    await runMigrations();
    await runSeeds();

    await userAgent.get('/test/token/user');
    await adminAgent.get('/test/token/admin');
    await managerAgent.get('/test/token/manager');
  });

  describe('GET /coupons', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.get('/coupons');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Não tem permissão', async () => {
      const response = await userAgent.get('/coupons');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });
  });
});
