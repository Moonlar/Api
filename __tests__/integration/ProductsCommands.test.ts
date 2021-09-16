import { matchers } from 'jest-json-schema';
import supertest from 'supertest';

import app from '../../src/App';
import conn, { runMigrations, runSeeds } from '../../src/database/Connection';
import { Errors, Success } from '../../src/utils/Response';
import { createDefaultProducts, productsData } from '../utils/data';

expect.extend(matchers);

const request = supertest(app);

describe('Product Commands Routes', () => {
  const userAgent = supertest.agent(app);
  const adminAgent = supertest.agent(app);
  const managerAgent = supertest.agent(app);

  let commandID: string;

  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
    await createDefaultProducts();

    await userAgent.get('/test/token/user');
    await adminAgent.get('/test/token/admin');
    await managerAgent.get('/test/token/manager');
  });

  describe('POST /product/:product_id/command', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.post(`/product/${productsData[2].id}/command/`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa permissão', async () => {
      const response = await userAgent.post(`/product/${productsData[2].id}/command/`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa permissão', async () => {
      const response = await adminAgent.post(`/product/${productsData[2].id}/command/`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Dados inválidos', async () => {
      const response = await managerAgent.post(`/product/${productsData[2].id}/command/`);

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (command undefined)', async () => {
      const response = await managerAgent
        .post(`/product/${productsData[2].id}/command/`)
        .send({ name: 'Command 4' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (name undefined)', async () => {
      const response = await managerAgent
        .post(`/product/${productsData[2].id}/command/`)
        .send({ command: 'command 4' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (invalid product)', async () => {
      const response = await managerAgent
        .post(`/product/invalid/command/`)
        .send({ name: 'Command 4', command: 'command 4' });

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Dados inválidos (deleted product)', async () => {
      const response = await managerAgent
        .post(`/product/${productsData[0].id}/command/`)
        .send({ name: 'Command 4', command: 'command 4' });

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Criar benefício', async () => {
      const response = await managerAgent
        .post(`/product/${productsData[2].id}/command/`)
        .send({ name: 'Command 4', command: 'command 4' });

      expect(response.statusCode).toBe(201);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.CREATED);

      const createdCommand = await conn('products_commands')
        .select('id')
        .where('name', 'Command 4')
        .where('deleted_at', null)
        .first();

      expect(createdCommand).toBeTruthy();
      expect(createdCommand).toHaveProperty('id');

      commandID = createdCommand.id;
    });
  });

  describe('PATCH /product/:product_id/command/:benefit_id', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.patch(`/product/${productsData[2].id}/command/${commandID}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa permissão', async () => {
      const response = await userAgent.patch(`/product/${productsData[2].id}/command/${commandID}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa permissão', async () => {
      const response = await adminAgent.patch(
        `/product/${productsData[2].id}/command/${commandID}`,
      );

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Dados inválidos', async () => {
      const response = await managerAgent.patch(
        `/product/${productsData[2].id}/command/${commandID}`,
      );

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Dados inválidos (invalid product)', async () => {
      const response = await managerAgent
        .patch(`/product/invalid/command/${commandID}`)
        .send({ name: 'Updated command' });

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Dados inválidos (deleted product)', async () => {
      const response = await managerAgent
        .patch(`/product/${productsData[0].id}/command/${commandID}`)
        .send({ name: 'Updated command' });

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Atualizar comando (name)', async () => {
      const response = await managerAgent
        .patch(`/product/${productsData[2].id}/command/${commandID}`)
        .send({ name: 'Updated command 4' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.UPDATED);

      const updatedCommand = await conn('products_commands')
        .select(['id', 'name'])
        .where('id', commandID)
        .where('deleted_at', null)
        .first();

      expect(updatedCommand).toBeTruthy();
      expect(updatedCommand).toHaveProperty('id');
      expect(updatedCommand).toHaveProperty('name', 'Updated command 4');

      commandID = updatedCommand.id;
    });

    it('(Manager) Atualizar comando (command)', async () => {
      const response = await managerAgent
        .patch(`/product/${productsData[2].id}/command/${commandID}`)
        .send({ command: 'updated command 4' });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.UPDATED);

      const updatedCommand = await conn('products_commands')
        .select(['id', 'command'])
        .where('id', commandID)
        .where('deleted_at', null)
        .first();

      expect(updatedCommand).toBeTruthy();
      expect(updatedCommand).toHaveProperty('id');
      expect(updatedCommand).toHaveProperty('command', 'updated command 4');

      commandID = updatedCommand.id;
    });
  });

  describe('DELETE /product/:product_id/command/:benefit_id', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.delete(`/product/${productsData[2].id}/command/${commandID}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa permissão', async () => {
      const response = await userAgent.delete(
        `/product/${productsData[2].id}/command/${commandID}`,
      );

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa permissão', async () => {
      const response = await adminAgent.delete(
        `/product/${productsData[2].id}/command/${commandID}`,
      );

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Produto não encontrado (deleted product)', async () => {
      const response = await managerAgent.delete(
        `/product/${productsData[0].id}/command/${commandID}`,
      );

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Produto não encontrado (invalid product)', async () => {
      const response = await managerAgent.delete(`/product/invalid/command/${commandID}`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Comando não encontrado (invalid command)', async () => {
      const response = await managerAgent.delete(`/product/${productsData[2].id}/command/invalid`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Remover dados', async () => {
      const response = await managerAgent.delete(
        `/product/${productsData[2].id}/command/${commandID}`,
      );

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.DELETED);

      const wasDeleted = await conn('products_commands')
        .select('id')
        .where('id', productsData[2].id)
        .where('deleted_at', null)
        .first();

      expect(wasDeleted).toBeFalsy();
    });
  });
});
