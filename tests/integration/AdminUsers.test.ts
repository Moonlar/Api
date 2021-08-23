import request from 'supertest';

import app from '../../src/App';
import conn, { runMigrations, runSeeds } from '../../src/database/Connection';

describe('GET /users', () => {
  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
  });

  afterAll(async () => {
    await conn.destroy();
  });

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

  it("should return that you don't have enough permission", async () => {
    const response = await request(app)
      .get('/admin/user')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty(
      'error',
      'You do not have permission to access this'
    );
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
});
