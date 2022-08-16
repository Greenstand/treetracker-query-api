import supertest from 'supertest';
import app from '../../server/app';
import seed from '../seed';

describe('', () => {
  it('countries/6632544', async () => {
    const response = await supertest(app).get('/countries/6632544');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 6632544,
      name: 'China',
    });
  });

  // 103.819073145824,36.5617653792527
  it('countries?lat=36.5617653792527&lon=103.819073145824', async () => {
    const response = await supertest(app).get(
      '/countries?lat=36.5617653792527&lon=103.819073145824',
    );
    expect(response.status).toBe(200);
    expect(response.body.countries[0]).toMatchObject({
      id: 6632544,
      name: 'China',
    });
  });

  it('countries/v2/6632544', async () => {
    const response = await supertest(app).get('/countries/v2/6632544');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 6632544,
      name: 'China',
    });
  });

  // 103.819073145824,36.5617653792527
  it('countries/v2/?lat=36.5617653792527&lon=103.819073145824', async () => {
    const response = await supertest(app).get(
      '/countries/v2/?lat=36.5617653792527&lon=103.819073145824',
    );
    expect(response.status).toBe(200);
    expect(response.body.countries[0]).toMatchObject({
      id: 6632544,
      name: 'China',
    });
  });

  it(
    'countries/leaderboard/Europe',
    async () => {
      const response = await supertest(app).get(
        '/countries/leaderboard/Europe',
      );
      expect(response.status).toBe(200);
      expect(response.body.countries[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        planted: expect.any(String),
        centroid: expect.stringMatching(/coordinates/),
      });
    },
    1000 * 600,
  );

  it('countries/v2/leaderboard', async () => {
    const response = await seed
      .clear()
      .then(async () =>
        seed
          .seed()
          .then(async () => supertest(app).get('/countries/v2/leaderboard')),
      );
    expect(response.status).toBe(200);
    expect(response.body.countries[0]).toMatchObject({
      id: 6632357,
      name: 'United States',
      planted: '2',
      centroid: expect.stringMatching(/coordinates/),
    });
    await seed.clear();
  });
});
