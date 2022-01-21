import supertest from 'supertest';
import app from '../../server/app';

describe('', () => {
  it('countries/6632544', async () => {
    const response = await supertest(app).get('/countries/6632544');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 6632544,
      name: 'China',
    });
  });

  //103.819073145824,36.5617653792527
  it('countries?lat=36.5617653792527&lon=103.819073145824', async () => {
    const response = await supertest(app).get(
      '/countries?lat=36.5617653792527&lon=103.819073145824',
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 6632544,
      name: 'China',
    });
  });

  it.only(
    'countries/leaderboard',
    async () => {
      const response = await supertest(app).get('/countries/leaderboard');
      expect(response.status).toBe(200);
      expect(response.body.countries[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        planted: expect.any(String),
        centroid: expect.stringMatching(/coordinates/),
      });
    },
    1000 * 60,
  );
});
