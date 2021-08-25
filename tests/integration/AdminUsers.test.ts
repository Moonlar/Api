import request from 'supertest';
import { matchers } from 'jest-json-schema';

import app from '../../src/App';
import { runMigrations, runSeeds } from '../../src/database/Connection';
import { GenerateToken } from '../../src/utils/GenerateToken';
import { userSchema } from '../lib/schemas';

expect.extend(matchers);

describe('POST /admin/user', () => {
  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
  });
});

describe('GET /admin/users', () => {
  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
  });

  it('Deve estar conectado para acessar', async () => {
    const response = await request(app)
      .get('/admin/users')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'error',
      'You need to be authenticated to access this feature'
    );
  });

  it('(USER) Sem permissões suficiente para acessar o recurso', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'mxd_',
      permission: 'user',
    });

    const response = await request(app)
      .get('/admin/users')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'error',
      'You do not have permission to access this'
    );
  });

  it('(ADMIN) Sem permissões suficiente para acessar o recurso', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'admin',
      permission: 'admin',
    });

    const response = await request(app)
      .get('/admin/users')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'error',
      'You do not have permission to access this'
    );
  });

  it('(MANAGER) Deve retornar dados válidos', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'manager',
      permission: 'manager',
    });

    const response = await request(app)
      .get('/admin/users')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('page', 1);
    expect(response.body).toHaveProperty('total_pages', 1);
    expect(response.body).toHaveProperty('total_users', 4);
    expect(response.body).toHaveProperty('limit');
    expect(typeof response.body.limit).toBe('number');
    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);

    response.body.users.forEach((user: any) => {
      expect(user).toMatchSchema(userSchema);
      expect(user.password).toBe(undefined);
      expect(user.email).toBe(undefined);
    });
  });
});

describe('GET /admin/user', () => {
  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
  });
});

describe('GET /admin/user/:identifier', () => {
  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
  });
});

describe('PATCH /admin/user/:identifier', () => {
  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
  });
});

describe('DELETE /admin/user/:identifier', () => {
  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
  });
});
