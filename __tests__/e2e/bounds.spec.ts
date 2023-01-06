import supertest from 'supertest';
import app from '../../server/app';

describe('testing bounds route', () => {
  it('bounds for planter', async () => {
    const response = await supertest(app).get('/bounds/?planter_id=5838');
    expect(response.status).toBe(200);
    const { bounds } = response.body;
    expect(bounds.ne).toBeInstanceOf(Array);
    expect(bounds.se).toBeInstanceOf(Array);
  });

  it('bounds for organisation', async () => {
    const response = await supertest(app).get('/bounds/?organisation_id=30');
    expect(response.status).toBe(200);
    const { bounds } = response.body;
    expect(bounds.ne).toBeInstanceOf(Array);
    expect(bounds.se).toBeInstanceOf(Array);
  });
});
