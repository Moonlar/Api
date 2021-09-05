import supertest from 'supertest';
import { matchers } from 'jest-json-schema';

import app from '../../src/App';
import { runMigrations, runSeeds } from '../../src/database/Connection';
import { createDefaultProducts, createDefaultServers } from '../utils/data';
import {
  productBenefitSchema,
  productSchema,
  productServerSchema,
} from '../utils/schemas';

expect.extend(matchers);

const request = supertest(app);

describe('Products Routes', () => {
  const userAgent = supertest.agent(app);
  const adminAgent = supertest.agent(app);
  const managerAgent = supertest.agent(app);

  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
    await createDefaultServers();
    await createDefaultProducts();

    await userAgent.get('/test/token/user');
    await adminAgent.get('/test/token/admin');
    await managerAgent.get('/test/token/manager');
  });

  describe('GET /products', () => {
    it('Deve retornar dados válidos', async () => {
      const response = await request.get('/products');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_products', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBeTruthy();

      response.body.products.forEach((product: any) => {
        expect(product).toMatchSchema(productSchema);
        expect(product.server).toMatchSchema(productServerSchema);
      });
    });

    it('(Admin) Deve retornar dados válidos', async () => {
      const response = await adminAgent.get('/products');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_products', 2);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBeTruthy();

      response.body.products.forEach((product: any) => {
        expect(product).toMatchSchema(productSchema);
        expect(product.server).toMatchSchema(productServerSchema);
        expect(product).toHaveProperty('active');
      });
    });

    it('(Manager) Deve retornar dados válidos', async () => {
      const response = await managerAgent.get('/products');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_products', 2);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBeTruthy();

      response.body.products.forEach((product: any) => {
        expect(product).toMatchSchema(productSchema);
        expect(product.server).toMatchSchema(productServerSchema);
        expect(product).toHaveProperty('active');
      });
    });

    it('Deve retornar dados válidos com parâmetros de busca (page)', async () => {
      const response = await request.get('/products').query({ page: 100 });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_products', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBeTruthy();

      response.body.products.forEach((product: any) => {
        expect(product).toMatchSchema(productSchema);
        expect(product.server).toMatchSchema(productServerSchema);
      });
    });

    it('Deve retornar dados válidos com parâmetros de busca (search)', async () => {
      const response = await request
        .get('/products')
        .query({ search: 'invalid' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_products', 0);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBeTruthy();
      expect(response.body.products.length).toBe(0);
    });
  });
});
