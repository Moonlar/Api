import { matchers } from 'jest-json-schema';
import supertest from 'supertest';

import app from '../../src/App';
import { runMigrations, runSeeds } from '../../src/database/Connection';
import { Errors } from '../../src/utils/Response';
import { createDefaultCoupons } from '../utils/data';
import { couponSchema } from '../utils/schemas';

expect.extend(matchers);

const request = supertest(app);

describe('Coupons Routes', () => {
  const userAgent = supertest.agent(app);
  const adminAgent = supertest.agent(app);
  const managerAgent = supertest.agent(app);

  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
    await createDefaultCoupons();

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

    it('(Admin) Retornar dados válidos', async () => {
      const response = await adminAgent.get('/coupons');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_coupons', 2);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('coupons');
      expect(Array.isArray(response.body.coupons)).toBe(true);

      response.body.coupons.forEach((coupon: any) => {
        expect(coupon).toMatchSchema(couponSchema);
        expect(new Date(coupon.starts_at).getTime()).not.toBeNaN();
        expect(new Date(coupon.ends_at).getTime()).not.toBeNaN();
      });
    });

    it('(Manager) Retornar dados válidos', async () => {
      const response = await managerAgent.get('/coupons');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_coupons', 2);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('coupons');
      expect(Array.isArray(response.body.coupons)).toBe(true);

      response.body.coupons.forEach((coupon: any) => {
        expect(coupon).toMatchSchema(couponSchema);
        expect(new Date(coupon.starts_at).getTime()).not.toBeNaN();
        expect(new Date(coupon.ends_at).getTime()).not.toBeNaN();
      });
    });

    it('(Manager) Retornar dados válidos com parâmetros de busca (search)', async () => {
      const response = await managerAgent.get('/coupons').query({ search: 'Inativo' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_coupons', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('coupons');
      expect(Array.isArray(response.body.coupons)).toBe(true);

      response.body.coupons.forEach((coupon: any) => {
        expect(coupon).toMatchSchema(couponSchema);
        expect(new Date(coupon.starts_at).getTime()).not.toBeNaN();
        expect(new Date(coupon.ends_at).getTime()).not.toBeNaN();
      });
    });

    it('(Manager) Retornar dados válidos com parâmetros de busca (page)', async () => {
      const response = await managerAgent.get('/coupons').query({ page: 0 });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_coupons', 2);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('coupons');
      expect(Array.isArray(response.body.coupons)).toBe(true);

      response.body.coupons.forEach((coupon: any) => {
        expect(coupon).toMatchSchema(couponSchema);
        expect(new Date(coupon.starts_at).getTime()).not.toBeNaN();
        expect(new Date(coupon.ends_at).getTime()).not.toBeNaN();
      });
    });

    it('(Manager) Retornar dados válidos com parâmetros de busca (invalid page)', async () => {
      const response = await managerAgent.get('/coupons').query({ page: 'invalid' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_coupons', 2);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('coupons');
      expect(Array.isArray(response.body.coupons)).toBe(true);

      response.body.coupons.forEach((coupon: any) => {
        expect(coupon).toMatchSchema(couponSchema);
        expect(new Date(coupon.starts_at).getTime()).not.toBeNaN();
        expect(new Date(coupon.ends_at).getTime()).not.toBeNaN();
      });
    });
  });
});
