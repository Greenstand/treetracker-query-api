import supertest from 'supertest';
import app from '../../server/app';

describe('trees', () => {
  it(
    'trees/{id}',
    async () => {
      const response = await supertest(app).get('/trees/192');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 192,
        lat: expect.anything(),
        lon: expect.anything(),
        species_id: 4,
        species_name: 'species_name_3',
        country_name: 'Ashmore and Cartier Islands',
        country_id: 230,
        organization_id: 13,
        organization_name: 'ISAP',
      });
    },
    1000 * 30,
  );

  it(
    'trees/{uuid}',
    async () => {
      const response = await supertest(app).get(
        '/trees/c48ebfc0-bbe4-4a3a-8cff-7e5f4ff12977',
      );
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 270,
        lat: expect.anything(),
        lon: expect.anything(),
        species_id: 2,
        species_name: 'species_name_3',
        country_name: 'Sierra Leone',
        country_id: 64,
        organization_id: 5,
        organization_name: 'UEMG',
      });
    },
    1000 * 30,
  );

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
    'trees?startDate=2022-02-23&endDate=2022-02-24',
    async () => {
      const response = await supertest(app).get(
        '/trees?startDate=2022-02-23&endDate=2022-02-24',
      );
      expect(response.status).toBe(200);
      expect(response.body.total).toBe(96);
      for (let i = 0; i < response.body.trees.length; i++) {
        expect(
          new Date(response.body.trees[i].time_created).getTime(),
        ).toBeGreaterThanOrEqual(new Date('2022-02-23T00:00:00Z').getTime());
        expect(
          new Date(response.body.trees[i].time_created).getTime(),
        ).toBeLessThan(new Date('2022-02-24T00:00:00Z').getTime());
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
      expect(response.body.trees.length).toBe(3);
      expect(response.body.trees[0]).toMatchObject({
        id: expect.any(Number),
      });
    },
    1000 * 30,
  );

  it(
    'trees?tag=photoless',
    async () => {
      const response = await supertest(app).get('/trees?tag=photoless');
      const expectedIds = [238];
      expect(response.status).toBe(200);
      expect(response.body.total).toBe(1);
      const returnedIds = [response.body.trees[0].id];
      expect(returnedIds).toEqual(expectedIds);
    },
    1000 * 30,
  );

  it(
    'trees?planter_id=5840&desc=true',
    async () => {
      const response = await supertest(app).get(
        '/trees?planter_id=5840&limit=1&order_by=id',
      );
      expect(response.status).toBe(200);
      expect(response.body.trees[0]).toMatchObject({
        id: 270,
        planter_id: 5840,
      });
    },
    1000 * 30,
  );

  it(
    'trees?planter_id=5840&desc=false',
    async () => {
      const response = await supertest(app).get(
        '/trees?planter_id=5840&order_by=id&desc=false&limit=1',
      );
      expect(response.status).toBe(200);
      expect(response.body.trees[0]).toMatchObject({
        id: 171,
        planter_id: 5840,
      });
    },
    1000 * 30,
  );

  it(
    'trees?wallet_id=9b25795c-a07b-4487-92cf-b9b784d5dfc0',
    async () => {
      const response = await supertest(app).get(
        '/trees?wallet_id=9b25795c-a07b-4487-92cf-b9b784d5dfc0',
      );
      expect(response.status).toBe(200);
      expect(response.body.trees[0]).toMatchObject({
        wallet_id: '9b25795c-a07b-4487-92cf-b9b784d5dfc0',
      });
    },
    1000 * 30,
  );
});
