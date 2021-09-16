import { matchers } from 'jest-json-schema';
import supertest from 'supertest';

import app from '../../src/App';
import conn, { runMigrations, runSeeds } from '../../src/database/Connection';
import { Errors, Success } from '../../src/utils/Response';
import {
  createDefaultProducts,
  createDefaultServers,
  productsData,
  serversData,
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

  const testProductIDs = {
    a: '',
    b: '',
  };

  const newTestProduct = {
    name: 'New product',
    description: 'New product description',
    price: 50,
    server_id: serversData[1].id,
    benefits: [{ name: 'Benefit 1', description: 'Benefit 1 description' }],
    commands: [{ name: 'Command 1', command: 'command 1' }],
  };

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
      const response = await request.get('/products').query({ search: 'invalid' });

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
        expect(benefit).toHaveProperty('deleted_at', undefined);
      });
    });

    it('(Admin) Deve retornar dados válidos', async () => {
      const response = await adminAgent.get(`/product/${productsData[2].id}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body.active).toBeTruthy();
      expect(response.body.server_id).toBeFalsy();
      expect(response.body).toMatchSchema(productSchema);
      expect(response.body).toHaveProperty('benefits');
      expect(response.body).toHaveProperty('server');
      expect(response.body.server).toMatchSchema(productServerSchema);
      expect(Array.isArray(response.body.benefits)).toBeTruthy();
      expect(Array.isArray(response.body.commands)).toBeTruthy();

      response.body.benefits.forEach((benefit: any) => {
        expect(benefit).toMatchSchema(productBenefitSchema);
        expect(benefit).toHaveProperty('deleted_at', undefined);
      });

      response.body.commands.forEach((command: any) => {
        expect(command).toMatchSchema(productCommandSchema);
        expect(command).toHaveProperty('deleted_at', undefined);
      });
    });

    it('(Manager) Deve retornar dados válidos', async () => {
      const response = await managerAgent.get(`/product/${productsData[2].id}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body.active).toBeTruthy();
      expect(response.body.server_id).toBeFalsy();
      expect(response.body).toMatchSchema(productSchema);
      expect(response.body).toHaveProperty('benefits');
      expect(response.body).toHaveProperty('server');
      expect(response.body.server).toMatchSchema(productServerSchema);
      expect(Array.isArray(response.body.benefits)).toBeTruthy();
      expect(Array.isArray(response.body.commands)).toBeTruthy();

      response.body.benefits.forEach((benefit: any) => {
        expect(benefit).toMatchSchema(productBenefitSchema);
        expect(benefit).toHaveProperty('deleted_at', undefined);
      });

      response.body.commands.forEach((command: any) => {
        expect(command).toMatchSchema(productCommandSchema);
        expect(command).toHaveProperty('deleted_at', undefined);
      });
    });
  });

  describe('POST /product', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.post('/product');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Precisa ter permissão', async () => {
      const response = await userAgent.post('/product');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Precisa ter permissão', async () => {
      const response = await adminAgent.post('/product');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Requisição invalida', async () => {
      const response = await managerAgent.post('/product');

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Requisição invalida (name undefined)', async () => {
      const response = await managerAgent
        .post('/product')
        .send({ ...newTestProduct, name: undefined });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Requisição invalida (description undefined)', async () => {
      const response = await managerAgent
        .post('/product')
        .send({ ...newTestProduct, description: undefined });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Requisição invalida (price undefined)', async () => {
      const response = await managerAgent
        .post('/product')
        .send({ ...newTestProduct, price: undefined });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Requisição invalida (server_id undefined)', async () => {
      const response = await managerAgent
        .post('/product')
        .send({ ...newTestProduct, server_id: undefined });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Requisição invalida (server_id invalid)', async () => {
      const response = await managerAgent
        .post('/product')
        .send({ ...newTestProduct, server_id: 'not_exists' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Requisição invalida (benefits undefined)', async () => {
      const response = await managerAgent
        .post('/product')
        .send({ ...newTestProduct, benefits: undefined });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Requisição invalida (benefits invalid)', async () => {
      const response = await managerAgent
        .post('/product')
        .send({ ...newTestProduct, benefits: 'invalid' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Requisição invalida (commands undefined)', async () => {
      const response = await managerAgent
        .post('/product')
        .send({ ...newTestProduct, commands: undefined });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Requisição invalida (commands invalid)', async () => {
      const response = await managerAgent
        .post('/product')
        .send({ ...newTestProduct, commands: 'invalid' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Criar produto', async () => {
      const response = await managerAgent
        .post('/product')
        .send({ ...newTestProduct, name: `${newTestProduct.name} - 1` });

      expect(response.statusCode).toBe(201);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.CREATED);

      const { id: productID }: { id: string | undefined } = await conn('products')
        .select('id')
        .where('name', `${newTestProduct.name} - 1`)
        .first();

      expect(productID).toBeTruthy();

      const benefits = await conn('products_benefits').select('id').where('product_id', productID);

      const commands = await conn('products_commands').select('id').where('product_id', productID);

      expect(benefits.length).toBe(1);
      expect(commands.length).toBe(1);

      testProductIDs.a = productID as string;
    });

    it('(Manager) Criar produto (sem benefits e commands)', async () => {
      const response = await managerAgent.post('/product').send({
        ...newTestProduct,
        name: `${newTestProduct.name} - 2`,
        benefits: [],
        commands: [],
      });

      expect(response.statusCode).toBe(201);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.CREATED);

      const { id: productID }: { id: string | undefined } = await conn('products')
        .select('id')
        .where('name', `${newTestProduct.name} - 2`)
        .first();

      expect(productID).toBeTruthy();

      const benefits = await conn('products_benefits').select('id').where('product_id', productID);

      const commands = await conn('products_commands').select('id').where('product_id', productID);

      expect(benefits.length).toBe(0);
      expect(commands.length).toBe(0);

      testProductIDs.b = productID as string;
    });
  });

  describe('PATCH /product/:id', () => {
    it('Precisa estar conectado', async () => {
      const response = await request.patch('/product/invalid');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Sem permissão', async () => {
      const response = await userAgent.patch('/product/invalid');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Sem permissão', async () => {
      const response = await adminAgent.patch('/product/invalid');

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Requisição invalida', async () => {
      const response = await managerAgent.patch('/product/invalid');

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Produto não encontrado', async () => {
      const response = await managerAgent.patch('/product/invalid').send({ name: 'Invalid' });

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Produto não encontrado (removido)', async () => {
      const response = await managerAgent
        .patch(`/product/${productsData[0].id}`)
        .send({ name: 'Invalid' });

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Dados da requisição inválidos', async () => {
      const response = await managerAgent
        .patch(`/product/${productsData[2].id}`)
        .send({ name: '', price: 'invalid', active: 'invalid' });

      expect(response.statusCode).toBe(400);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.INVALID_REQUEST);
    });

    it('(Manager) Atualizar dados', async () => {
      const response = await managerAgent
        .patch(`/product/${testProductIDs.a}`)
        .send({ name: 'Updated 1', active: true });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.UPDATED);

      const data = await conn('products')
        .select(['name', 'active'])
        .where('id', testProductIDs.a)
        .first();

      expect(data).toHaveProperty('name', 'Updated 1');
      expect(data).toHaveProperty('active', 1);
    });
  });

  describe('DELETE /product/:id', () => {
    it('Deve estar conectado para remover produtos', async () => {
      const response = await request.delete(`/product/${testProductIDs.a}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NEED_AUTHENTICATE);
    });

    it('(User) Deve ter permissão para isso', async () => {
      const response = await userAgent.delete(`/product/${testProductIDs.a}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Admin) Deve ter permissão para isso', async () => {
      const response = await adminAgent.delete(`/product/${testProductIDs.a}`);

      expect(response.statusCode).toBe(401);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NO_PERMISSION);
    });

    it('(Manager) Deve retornar que produto não foi encontrado', async () => {
      const response = await managerAgent.delete(`/product/${productsData[0].id}`);

      expect(response.statusCode).toBe(404);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('error', Errors.NOT_FOUND);
    });

    it('(Manager) Deve remover produto', async () => {
      const response = await managerAgent.delete(`/product/${testProductIDs.a}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeTruthy();
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeTruthy();
      expect(response.body).toHaveProperty('message', Success.DELETED);

      const wasDeleted = await conn('products')
        .select('id')
        .where('id', testProductIDs.a)
        .where('deleted_at', null)
        .first();

      expect(wasDeleted).toBeFalsy();
    });
  });
});
