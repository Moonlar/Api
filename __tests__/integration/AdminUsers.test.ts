import { matchers } from 'jest-json-schema';
import supertest from 'supertest';

import app from '../../src/App';
import conn, { runMigrations, runSeeds } from '../../src/database/Connection';
import { Errors, Success } from '../../src/utils/Response';
import { createDefaultUsers } from '../utils/data';
import { userSchema } from '../utils/schemas';

expect.extend(matchers);

const request = supertest(app);

describe('Admin Users Routes', () => {
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

  describe('GET /admin/users', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.get('/admin/users');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa ter permissão', async () => {
      const response = await userAgent.get('/admin/users');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa ter permissão', async () => {
      const response = await adminAgent.get('/admin/users');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Deve retornar dados válidos', async () => {
      const response = await managerAgent.get('/admin/users');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_users', 3);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);

      response.body.users.forEach((user: any) => {
        expect(user).toMatchSchema(userSchema);
      });
    });

    it('Deve retornar dados válidos com parâmetros de busca', async () => {
      const response = await managerAgent.get('/admin/users').query({ search: 'Man' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_users', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBe(1);
      expect(response.body.users[0]).toMatchSchema(userSchema);
    });

    it('Deve retornar dados válidos com parâmetros de busca inválidos (Invalid page)', async () => {
      const response = await managerAgent.get('/admin/users').query({ page: 1000 });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_users', 3);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBe(3);

      response.body.users.forEach((user: any) => {
        expect(user).toMatchSchema(userSchema);
      });
    });

    it('Deve retornar dados válidos com parâmetros de busca inválidos (NaN page)', async () => {
      const response = await managerAgent.get('/admin/users').query({ page: 'invalid' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('total_pages', 1);
      expect(response.body).toHaveProperty('total_users', 3);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBe(3);

      response.body.users.forEach((user: any) => {
        expect(user).toMatchSchema(userSchema);
      });
    });
  });

  describe('GET /admin/user/:identifier', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.get('/admin/user/default');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa ter permissão', async () => {
      const response = await userAgent.get('/admin/user/default');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa ter permissão', async () => {
      const response = await adminAgent.get('/admin/user/default');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Usuário não encontrado', async () => {
      const response = await managerAgent.get('/admin/user/not_found');

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Usuário não encontrado (Deleted)', async () => {
      const response = await managerAgent.get('/admin/user/deleted');

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Retorna dados válidos', async () => {
      const response = await managerAgent.get('/admin/user/admin');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toMatchSchema(userSchema);
    });
  });

  describe('GET /admin/user', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.get('/admin/user/default');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(Manager) Retorna dados válidos', async () => {
      const response = await managerAgent.get('/admin/user');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toMatchSchema(userSchema);
    });
  });

  describe('POST /admin/user', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.post('/admin/user');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa ter permissão', async () => {
      const response = await userAgent.post('/admin/user');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa ter permissão', async () => {
      const response = await adminAgent.post('/admin/user');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Dados inválidos (none data)', async () => {
      const response = await managerAgent.post('/admin/user');

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (none nickname)', async () => {
      const response = await managerAgent.post('/admin/user').send({ email: 'valid@gmail.com' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (none email)', async () => {
      const response = await managerAgent.post('/admin/user').send({ nickname: 'Valid' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos', async () => {
      const response = await managerAgent
        .post('/admin/user')
        .send({ nickname: 'Invalid%', email: 'invalid' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados em uso (nickname)', async () => {
      const response = await managerAgent
        .post('/admin/user')
        .send({ nickname: 'Default', email: 'new@gmail.com' });

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados em uso (email)', async () => {
      const response = await managerAgent
        .post('/admin/user')
        .send({ nickname: 'New_', email: 'default@gmail.com' });

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Criar usuário', async () => {
      const response = await managerAgent
        .post('/admin/user')
        .send({ nickname: 'New_', email: 'new@gmail.com' });

      expect(response.statusCode).toBe(201);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.CREATED);

      const createdUser = await conn('admin_users').select('*').where('identifier', 'new_').first();

      expect(createdUser).toBeTruthy();
    });
  });

  describe('PATCH /admin/user/:identifier', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.patch('/admin/user/new_');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa ter permissão', async () => {
      const response = await userAgent.patch('/admin/user/new_');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa ter permissão', async () => {
      const response = await adminAgent.patch('/admin/user/new_');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Sem dados para atualizar', async () => {
      const response = await managerAgent.patch('/admin/user/new_');

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (nickname)', async () => {
      const response = await managerAgent
        .patch('/admin/user/new_')
        .send({ nickname: ' $invalid@' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (email)', async () => {
      const response = await managerAgent.patch('/admin/user/new_').send({ email: ' $invalid@' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (permission)', async () => {
      const response = await managerAgent.patch('/admin/user/new_').send({ permission: ' user' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados em uso (nickname)', async () => {
      const response = await managerAgent.patch('/admin/user/new_').send({ nickname: 'admin' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados em uso (email)', async () => {
      const response = await managerAgent
        .patch('/admin/user/new_')
        .send({ email: 'admin@gmail.com' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Atualizar dados', async () => {
      const response = await managerAgent
        .patch('/admin/user/new_')
        .send({ email: 'updated@gmail.com', nickname: 'Updated' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.UPDATED);

      const updatedUser = await conn('admin_users').select('*').where('identifier', 'updated');

      expect(updatedUser).toBeTruthy();
    });
  });

  describe('DELETE /admin/user/:identifier', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.delete('/admin/user/updated');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa ter permissão', async () => {
      const response = await userAgent.delete('/admin/user/updated');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa ter permissão', async () => {
      const response = await adminAgent.delete('/admin/user/updated');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Usuário não encontrado', async () => {
      const response = await managerAgent.delete('/admin/user/invalid');

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Usuário não encontrado', async () => {
      const response = await managerAgent.delete('/admin/user/updated');

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.DELETED);

      const deleted = await conn('admin_users')
        .select('id')
        .where('identifier', 'deleted')
        .where('deleted_at', null)
        .first();

      expect(deleted).toBeFalsy();
    });
  });
});
