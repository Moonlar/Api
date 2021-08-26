import supertest from 'supertest';
import { matchers } from 'jest-json-schema';

import app from '../../src/App';
import { runMigrations, runSeeds } from '../../src/database/Connection';
import { createDefaultUsers } from '../utils/data';

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

  describe('POST /admin/auth', () => {
    it('(User) Deve retornar que não pode estar conectado', async () => {
      const response = await userAgent.post('/admin/auth');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty(
        'error',
        'You are already connected'
      );
    });

    it('(Admin) Deve retornar que não pode estar conectado', async () => {
      const response = await adminAgent.post('/admin/auth');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty(
        'error',
        'You are already connected'
      );
    });

    it('(Manager) Deve retornar que não pode estar conectado', async () => {
      const response = await managerAgent.post('/admin/auth');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty(
        'error',
        'You are already connected'
      );
    });

    it('Deve retornar dados inválidos (sem dados)', async () => {
      const response = await request.post('/admin/auth');

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', 'Invalid body');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Deve retornar dados inválidos (sem email)', async () => {
      const response = await request
        .post('/admin/auth')
        .send({ password: '12345678' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', 'Invalid body');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Deve retornar dados inválidos (email inválido)', async () => {
      const response = await request
        .post('/admin/auth')
        .send({ email: 'dwioq dq dwq $  ', password: '12345678' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', 'Invalid body');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Deve retornar dados inválidos (sem password)', async () => {
      const response = await request
        .post('/admin/auth')
        .send({ email: 'default@gmail.com' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', 'Invalid body');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Deve retornar dados inválidos (password inválido)', async () => {
      const response = await request
        .post('/admin/auth')
        .send({ email: 'default@gmail.com', password: '1' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', 'Invalid body');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Deve retornar usuário não encontrado', async () => {
      const response = await request
        .post('/admin/auth')
        .send({ email: 'notfound@gmail.com', password: '12345678' });

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', 'User not exists');
    });

    it('Deve retornar senha incorreta', async () => {
      const response = await request
        .post('/admin/auth')
        .send({ email: 'default@gmail.com', password: 'wrongpass' });

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', 'Wrong password');
    });

    it('Deve efetuar login', async () => {
      const response = await request
        .post('/admin/auth')
        .send({ email: 'default@gmail.com', password: '12345678' });

      expect(response.statusCode).toBe(201);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['set-cookie'].toString()).toMatch(/token=/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', 'Successfully logged in');
    });
  });

  describe('DELETE /admin/auth', () => {
    it('Deve retornar que tem que estar conectado', async () => {
      const response = await request.delete('/admin/auth');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty(
        'error',
        'You need to be authenticated to access this feature'
      );
    });

    it('(User) Deve efetuar logout', async () => {
      const response = await userAgent.delete('/admin/auth');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['set-cookie'].toString()).toMatch(/token=;/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', 'You disconnected');
    });

    it('(Admin) Deve efetuar logout', async () => {
      const response = await adminAgent.delete('/admin/auth');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['set-cookie'].toString()).toMatch(/token=;/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', 'You disconnected');
    });

    it('(Manager) Deve efetuar logout', async () => {
      const response = await managerAgent.delete('/admin/auth');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['set-cookie'].toString()).toMatch(/token=;/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', 'You disconnected');
    });
  });
});
