import request from 'supertest';

import app from '../../src/App';
import conn, { runMigrations, runSeeds } from '../../src/database/Connection';
import { matchers } from 'jest-json-schema';
import { GenerateToken } from '../../src/utils/GenerateToken';
import { admin, manager, user } from '../lib/data';
import { userSchema } from '../lib/schemas';

expect.extend(matchers);

describe('GET /admin/users', () => {
  beforeAll(async () => {
    await runMigrations();
    await runSeeds();

    await conn('admin_users').insert([user, admin, manager]);
  });

  afterAll(async () => {
    await conn.destroy();
  });

  /* GET /admin/users */

  it('should be logged in to get users', async () => {
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

  it("should be return that you don't have enough permission to access this feature", async () => {
    let response, token;

    token = GenerateToken(1000000, {
      nickname: 'mxd_',
      permission: 'user',
    });

    response = await request(app)
      .get('/admin/users')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'error',
      'You do not have permission to access this'
    );

    token = GenerateToken(1000000, {
      nickname: 'admin',
      permission: 'admin',
    });

    response = await request(app)
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

  it('should be return valid data', async () => {
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
    expect(response.body).toHaveProperty('total_users', 3);
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

  /* GET /admin/user */

  it("should be return that you don't have enough permission to access this feature", async () => {
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

  it('should be return the logged user info', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'mxd_',
      permission: 'user',
    });

    const response = await request(app)
      .get('/admin/user')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toBeTruthy();
  });

  it('should be logged in to get logged user info', async () => {
    const response = await request(app)
      .get('/admin/user')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'error',
      'You need to be authenticated to access this feature'
    );
  });

  it('should be a valid response', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'admin',
      permission: 'admin',
    });

    const response = await request(app)
      .get('/admin/user')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchSchema(userSchema);
    expect(response.body.password).toBe(undefined);
  });

  /* GET /admin/user/:nickname */

  it("should be return that you don't have enough permission to get another user info", async () => {
    const token = GenerateToken(1000000, {
      nickname: 'mxd_',
      permission: 'user',
    });

    const response = await request(app)
      .get('/admin/user/Admin')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/);

    expect(response.statusCode).toBe(401);
    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'error',
      'You do not have permission to access this feature'
    );
  });

  it('should be user not found', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'manager',
      permission: 'manager',
    });

    const response = await request(app)
      .get('/admin/user/NotExist')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/);

    expect(response.statusCode).toBe(404);
    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  it('should be a valid response', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'manager',
      permission: 'manager',
    });

    const response = await request(app)
      .get('/admin/user/MxD_')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchSchema(userSchema);
    expect(response.body.password).toBe(undefined);
  });

  /* POST /admin/user */

  it('should be logged in when creating new user', async () => {
    const response = await request(app)
      .post('/admin/user')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'error',
      'You need to be authenticated to access this feature'
    );
  });

  it('should be have permission when creating new user', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'admin',
      permission: 'admin',
    });

    const response = await request(app)
      .post('/admin/user')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'error',
      'You do not have permission to perform this action'
    );
  });

  it('should be send valid data', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'manager',
      permission: 'manager',
    });

    let response = await request(app)
      .post('/admin/user')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('error', 'Invalid body');
    expect(Array.isArray(response.body.errors)).toBe(true);

    let data = {
      nickname: 'A B$',
      email: 'mail@gmail.com',
    };

    response = await request(app)
      .post('/admin/user')
      .send(data)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('error', 'Invalid body');
    expect(Array.isArray(response.body.errors)).toBe(true);

    data = {
      nickname: 'Valid',
      email: 'mail',
    };

    response = await request(app)
      .post('/admin/user')
      .send(data)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('error', 'Invalid body');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  it('should be non-existent user', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'manager',
      permission: 'manager',
    });

    let response, data;

    /* Tests nickname */

    data = {
      nickname: 'MxD_',
      email: 'noexist@gmail.com',
    };

    response = await request(app)
      .post('/admin/user')
      .send(data)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('error', 'User already exist');

    /* Tests email */

    data = {
      nickname: 'NoExists',
      email: 'mxd@gmail.com',
    };

    response = await request(app)
      .post('/admin/user')
      .send(data)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('error', 'User already exist');
  });

  it('should be create a new user', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'manager',
      permission: 'manager',
    });

    const data = {
      nickname: '     NewUser     ',
      email: '    newuser@gmail.com     ',
    };

    let response = await request(app)
      .post('/admin/user')
      .send(data)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'message',
      'User created successfully'
    );

    response = await request(app)
      .get('/admin/user/NewUser')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchSchema(userSchema);
    expect(response.body.password).toBe(undefined);
    expect(response.body.nickname).toBe(data.nickname.toLowerCase().trim());
    expect(response.body.display_name).toBe(data.nickname.trim());
    expect(response.body.email).toBe(data.email.trim());
  });

  /* PATCH /admin/user/:id */

  it('should be not allowed to execute', async () => {
    /* Without Token */
    let response = await request(app)
      .patch('/admin/user')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'error',
      'You need to be authenticated to access this feature'
    );

    /* With User Token */
    let token = GenerateToken(1000000, {
      nickname: 'mxd_',
      permission: 'user',
    });

    response = await request(app)
      .patch('/admin/user')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'error',
      'You do not have permission to access this feature'
    );

    /* With Admin Token */
    token = GenerateToken(1000000, {
      nickname: 'admin',
      permission: 'admin',
    });

    response = await request(app)
      .patch('/admin/user')
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'error',
      'You do not have permission to access this feature'
    );
  });

  it('should be invalid data to update', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'manager',
      permission: 'manager',
    });

    /* No data */
    let data = {};

    let response = await request(app)
      .patch('/admin/user')
      .send(data)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('error', 'No data to update');

    /* Invalid data nickname */
    data = {
      nickname: 'dwnq dqwj $',
    };

    response = await request(app)
      .patch('/admin/user')
      .send(data)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('error', 'Invalid body');

    /* Invalid data email */
    data = {
      email: 'dwnq dqwj $',
    };

    response = await request(app)
      .patch('/admin/user')
      .send(data)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('error', 'Invalid body');

    /* Invalid data permission */
    data = {
      permission: 'dwnq dqwj $',
    };

    response = await request(app)
      .patch('/admin/user')
      .send(data)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('error', 'Invalid body');
  });

  it('should be update a user', async () => {
    const token = GenerateToken(1000000, {
      nickname: 'manager',
      permission: 'manager',
    });

    /* Update nickname and display_name */
    let data = {
      nickname: 'UpdatedUser',
    } as {
      nickname: string;
      email: string | undefined;
      permission: 'admin' | 'manager' | undefined;
    };

    let response = await request(app)
      .patch(`/admin/user/newuser`)
      .send(data)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('message', 'User update successfully');

    response = await request(app)
      .get(`/admin/user/${data.nickname}`)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeTruthy();
    expect(response.body).toMatchSchema(userSchema);
    expect(response.body.nickname).toBe(data.nickname.toLowerCase());
    expect(response.body.display_name).toBe(data.nickname);
    expect(response.body.password).toBe(undefined);

    /* Update email */
    data.email = 'updated@gmail.com';

    response = await request(app)
      .patch(`/admin/user/${data.nickname}`)
      .send({ ...data, nickname: undefined })
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('message', 'User update successfully');

    response = await request(app)
      .get(`/admin/user/${data.nickname}`)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeTruthy();
    expect(response.body).toMatchSchema(userSchema);
    expect(response.body.nickname).toBe(data.nickname.toLowerCase());
    expect(response.body.display_name).toBe(data.nickname);
    expect(response.body.email).toBe((data.email || '').toLowerCase());
    expect(response.body.password).toBe(undefined);

    /* Update permission */
    data.permission = 'admin';
    data.email = undefined;

    response = await request(app)
      .patch(`/admin/user/${data.nickname}`)
      .send({ ...data, nickname: undefined })
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('message', 'User update successfully');

    response = await request(app)
      .get(`/admin/user/${data.nickname}`)
      .set('Cookie', [`token=${token}`])
      .expect('Content-Type', /json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeTruthy();
    expect(response.body).toMatchSchema(userSchema);
    expect(response.body.password).toBe(undefined);
    expect(response.body.nickname).toBe(data.nickname.toLowerCase());
    expect(response.body.display_name).toBe(data.nickname);
    expect(response.body.permission).toBe(
      (data.permission || '').toLowerCase()
    );
  });
});
