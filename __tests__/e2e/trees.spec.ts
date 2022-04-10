import supertest from 'supertest';
import app from '../../server/app';

describe('trees', () => {
  it('trees/{id}', async () => {
    const response = await supertest(app).get('/trees/912681');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 912681,
      lat: expect.anything(),
      lon: expect.anything(),
    });
  });

  it('Unknown tree', async () => {
    const response = await supertest(app).get('/trees/1');
    expect(response.status).toBe(404);
  });

  it('trees?limit=1&offset=0', async () => {
    const response = await supertest(app).get('/trees?limit=1&offset=0');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      trees: expect.anything(),
    });
  });

  it('trees?limit=1&offset=0', async () => {
    const response = await supertest(app).get('/trees?limit=1&offset=0');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      trees: expect.anything(),
    });
  });

  it(
    'trees?limit=1&organization_id=11',
    async () => {
      const response = await supertest(app).get(
        '/trees?limit=1&organization_id=11',
      );
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        trees: expect.anything(),
      });
      expect(response.body.trees[0]).toMatchObject({
        organization_id: 11,
      });
    },
    1000 * 60,
  );

  it(
    'trees?startDate=2021-02-26&endDate=2021-12-22',
    async () => {
      const response = await supertest(app).get(
        '/trees?startDate=2021-02-26&endDate=2021-12-22',
      );
      expect(response.status).toBe(200);
      for (let i = 0; i < response.body.trees.length; i++) {
        expect(
          new Date(response.body.trees[i].time_created).getTime(),
        ).toBeGreaterThanOrEqual(new Date('2021-02-26T00:00:00Z').getTime());
        expect(
          new Date(response.body.trees[i].time_created).getTime(),
        ).toBeLessThan(new Date('2021-12-23T00:00:00Z').getTime());
      }
    },
    1000 * 60,
  );

  it(
    'trees/featured',
    async () => {
      const response = await supertest(app).get('/trees/featured');
      expect(response.status).toBe(200);
      // expect(response.body).toMatchObject({
      //   trees: expect.anything(),
      // });
      expect(response.body.trees[0]).toMatchObject({
        id: expect.any(Number),
      });
    },
    1000 * 10,
  );
});
