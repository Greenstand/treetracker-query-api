const request = require('supertest');
const server = require('./app');

describe('', () => {
  it('Test header: content-type: application/json', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toBe(200);
  });

  it('Test header: content-type: application/json', async () => {
    const res = await request(server).post('/');
    expect(res.statusCode).toBe(415);
    expect(res.body).toHaveProperty('message', /application.json/);
  });
});
