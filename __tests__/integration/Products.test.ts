import supertest from 'supertest';
import { matchers } from 'jest-json-schema';

import app from '../../src/App';
import { runMigrations, runSeeds } from '../../src/database/Connection';
import { Errors } from '../../src/utils/Response';
import {
  createDefaultProducts,
  createDefaultServers,
  productsData,
} from '../utils/data';
import {
  productSchema,
  productBenefitSchema,
  productCommandSchema,
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

  describe('GET /product/:id', () => {
    it('Produto inexistente', async () => {
      const response = await request.get('/product/invalid');

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Admin) Produto inexistente', async () => {
      const response = await adminAgent.get('/product/invalid');

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Produto inexistente', async () => {
      const response = await managerAgent.get('/product/invalid');

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('Produto removido', async () => {
      const response = await request.get(`/product/${productsData[0].id}`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Admin) Produto removido', async () => {
      const response = await adminAgent.get(`/product/${productsData[0].id}`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Produto removido', async () => {
      const response = await managerAgent.get(`/product/${productsData[0].id}`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('Produto desativado', async () => {
      const response = await request.get(`/product/${productsData[1].id}`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Admin) Produto desativado', async () => {
      const response = await adminAgent.get(`/product/${productsData[1].id}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body.active).toBeFalsy();
      expect(response.body.server_id).toBeFalsy();
      expect(response.body).toMatchSchema(productSchema);
      expect(response.body).toHaveProperty('benefits');
      expect(response.body).toHaveProperty('commands');
      expect(response.body).toHaveProperty('server');
      expect(response.body.server).toMatchSchema(productServerSchema);
      expect(Array.isArray(response.body.benefits)).toBeTruthy();
      expect(Array.isArray(response.body.commands)).toBeTruthy();

      response.body.benefits.forEach((benefit: any) => {
        expect(benefit).toMatchSchema(productBenefitSchema);
      });

      response.body.commands.forEach((command: any) => {
        expect(command).toMatchSchema(productCommandSchema);
      });
    });

    it('(Manager) Produto desativado', async () => {
      const response = await managerAgent.get(`/product/${productsData[1].id}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body.active).toBeFalsy();
      expect(response.body.server_id).toBeFalsy();
      expect(response.body).toMatchSchema(productSchema);
      expect(response.body).toHaveProperty('benefits');
      expect(response.body).toHaveProperty('commands');
      expect(response.body).toHaveProperty('server');
      expect(response.body.server).toMatchSchema(productServerSchema);
      expect(Array.isArray(response.body.benefits)).toBeTruthy();
      expect(Array.isArray(response.body.commands)).toBeTruthy();

      response.body.benefits.forEach((benefit: any) => {
        expect(benefit).toMatchSchema(productBenefitSchema);
      });

      response.body.commands.forEach((command: any) => {
        expect(command).toMatchSchema(productCommandSchema);
      });
    });

    it('Deve retornar dados válidos', async () => {
      const response = await request.get(`/product/${productsData[2].id}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body.active).toBeFalsy();
      expect(response.body.commands).toBeFalsy();
      expect(response.body.server_id).toBeFalsy();
      expect(response.body).toMatchSchema(productSchema);
      expect(response.body).toHaveProperty('benefits');
      expect(response.body).toHaveProperty('server');
      expect(response.body.server).toMatchSchema(productServerSchema);
      expect(Array.isArray(response.body.benefits)).toBeTruthy();

      response.body.benefits.forEach((benefit: any) => {
        expect(benefit).toMatchSchema(productBenefitSchema);
      });
    });
  });
});
