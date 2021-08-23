import request from 'supertest';

import app from '../../src/App';

describe('GET /', () => {
  it('should answer with a json', async () => {
    const response = await request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('environment', 'test');
  });
});
