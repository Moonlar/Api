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
        expect(product.commands).toBeFalsy();
        expect(product.benefits).toBeTruthy();
        expect(Array.isArray(product.benefits)).toBeTruthy();

        product.benefits.forEach((benefit: any) => {
          expect(benefit).toMatchSchema(productBenefitSchema);
        });
      });
    });
  });
});
