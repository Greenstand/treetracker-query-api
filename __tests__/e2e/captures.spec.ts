import supertest from 'supertest';
import app from '../../server/app';

describe('', () => {
  it('v2/captures/{id}', async () => {
    const response = await supertest(app).get(
      '/v2/captures/bc276072-440f-4a2d-9c4a-69f7f29201e6',
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 'bc276072-440f-4a2d-9c4a-69f7f29201e6',
    });
  });
});
