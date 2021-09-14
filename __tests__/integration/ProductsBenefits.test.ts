import supertest from 'supertest';
import { matchers } from 'jest-json-schema';

import app from '../../src/App';
import conn, { runMigrations, runSeeds } from '../../src/database/Connection';
import { createDefaultProducts, productsData } from '../utils/data';
import { Errors, Success } from '../../src/utils/Response';

expect.extend(matchers);

const request = supertest(app);

describe('Product Benefits Routes', () => {
  const userAgent = supertest.agent(app);
  const adminAgent = supertest.agent(app);
  const managerAgent = supertest.agent(app);

  let benefitID: string;

  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
    await createDefaultProducts();

    await userAgent.get('/test/token/user');
    await adminAgent.get('/test/token/admin');
    await managerAgent.get('/test/token/manager');
  });

  describe('POST /:product_id', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.post(`/product/${productsData[2].id}/benefit/`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa permissão', async () => {
      const response = await userAgent.post(`/product/${productsData[2].id}/benefit/`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa permissão', async () => {
      const response = await adminAgent.post(`/product/${productsData[2].id}/benefit/`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Dados inválidos', async () => {
      const response = await managerAgent.post(`/product/${productsData[2].id}/benefit/`);

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (description undefined)', async () => {
      const response = await managerAgent
        .post(`/product/${productsData[2].id}/benefit/`)
        .send({ name: 'Benefit 4' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (name undefined)', async () => {
      const response = await managerAgent
        .post(`/product/${productsData[2].id}/benefit/`)
        .send({ description: 'Benefit 4' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (invalid product)', async () => {
      const response = await managerAgent
        .post(`/product/invalid/benefit/`)
        .send({ name: 'Benefit 4', description: 'Benefit 4' });

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Dados inválidos (deleted product)', async () => {
      const response = await managerAgent
        .post(`/product/${productsData[0].id}/benefit/`)
        .send({ name: 'Benefit 4', description: 'Benefit 4' });

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Criar benefício', async () => {
      const response = await managerAgent
        .post(`/product/${productsData[2].id}/benefit/`)
        .send({ name: 'Benefit 4', description: 'Benefit 4' });

      expect(response.statusCode).toBe(201);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.CREATED);

      const createdBenefit = await conn('products_benefits')
        .select('id')
        .where('name', 'Benefit 4')
        .where('deleted_at', null)
        .first();

      expect(createdBenefit).toBeTruthy();
      expect(createdBenefit).toHaveProperty('id');

      benefitID = createdBenefit.id;
    });
  });
});
