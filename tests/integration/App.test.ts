import request from 'supertest';

import app from '../../src/App';
import { runMigrations, runSeeds } from '../../src/database/Connection';

describe('GET /', () => {
  beforeAll(async () => {
    await runMigrations();
    await runSeeds();
  });

  it('Deve retornar um json', async () => {
    const response = await request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('environment', 'test');
  });
});
