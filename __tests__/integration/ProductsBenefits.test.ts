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

  describe('POST /product/:product_id/benefit', () => {
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

  describe('PATCH /product/:product_id/benefit/:benefit_id', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.patch(`/product/${productsData[2].id}/benefit/${benefitID}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa permissão', async () => {
      const response = await userAgent.patch(`/product/${productsData[2].id}/benefit/${benefitID}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa permissão', async () => {
      const response = await adminAgent.patch(
        `/product/${productsData[2].id}/benefit/${benefitID}`
      );

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Dados inválidos', async () => {
      const response = await managerAgent.patch(
        `/product/${productsData[2].id}/benefit/${benefitID}`
      );

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (invalid product)', async () => {
      const response = await managerAgent
        .patch(`/product/invalid/benefit/${benefitID}`)
        .send({ name: 'Updated benefit' });

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Dados inválidos (deleted product)', async () => {
      const response = await managerAgent
        .patch(`/product/${productsData[0].id}/benefit/${benefitID}`)
        .send({ name: 'Updated benefit' });

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Atualizar benefício (name)', async () => {
      const response = await managerAgent
        .patch(`/product/${productsData[2].id}/benefit/${benefitID}`)
        .send({ name: 'Updated benefit 4' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.UPDATED);

      const createdBenefit = await conn('products_benefits')
        .select(['id', 'name'])
        .where('id', benefitID)
        .where('deleted_at', null)
        .first();

      expect(createdBenefit).toBeTruthy();
      expect(createdBenefit).toHaveProperty('id');
      expect(createdBenefit).toHaveProperty('name', 'Updated benefit 4');

      benefitID = createdBenefit.id;
    });

    it('(Manager) Atualizar benefício (description)', async () => {
      const response = await managerAgent
        .patch(`/product/${productsData[2].id}/benefit/${benefitID}`)
        .send({ description: 'Updated benefit 4' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.UPDATED);

      const createdBenefit = await conn('products_benefits')
        .select(['id', 'description'])
        .where('id', benefitID)
        .where('deleted_at', null)
        .first();

      expect(createdBenefit).toBeTruthy();
      expect(createdBenefit).toHaveProperty('id');
      expect(createdBenefit).toHaveProperty('description', 'Updated benefit 4');

      benefitID = createdBenefit.id;
    });
  });

  describe('DELETE /product/:product_id/benefit/:benefit_id', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.delete(`/product/${productsData[2].id}/benefit/${benefitID}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa permissão', async () => {
      const response = await userAgent.delete(
        `/product/${productsData[2].id}/benefit/${benefitID}`
      );

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa permissão', async () => {
      const response = await adminAgent.delete(
        `/product/${productsData[2].id}/benefit/${benefitID}`
      );

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Produto não encontrado (deleted product)', async () => {
      const response = await managerAgent.delete(
        `/product/${productsData[0].id}/benefit/${benefitID}`
      );

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Produto não encontrado (invalid product)', async () => {
      const response = await managerAgent.delete(`/product/invalid/benefit/${benefitID}`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Benefício não encontrado (invalid benefit)', async () => {
      const response = await managerAgent.delete(`/product/${productsData[2].id}/benefit/invalid`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Remover dados', async () => {
      const response = await managerAgent.delete(
        `/product/${productsData[2].id}/benefit/${benefitID}`
      );

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.DELETED);

      const wasDeleted = await conn('products_benefits')
        .select('id')
        .where('id', productsData[2].id)
        .where('deleted_at', null)
        .first();

      expect(wasDeleted).toBeFalsy();
    });
  });
});
