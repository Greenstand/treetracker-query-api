import supertest from 'supertest';
import app from '../../server/app';

describe('species', () => {
  it('species/{id}', async () => {
    const response = await supertest(app).get('/species/8');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 8,
      name: expect.any(String),
    });
  });

  it(
    'species?organization_id=1&limit=1',
    async () => {
      const response = await supertest(app).get(
        '/species?organization_id=1&limit=1',
      );
      expect(response.status).toBe(200);
      expect(response.body.species).toBeInstanceOf(Array);
      expect(response.body.species[0]).toMatchObject({
        total: expect.stringMatching(/\d+/),
        name: expect.any(String),
        id: expect.any(Number),
        desc: expect.any(String),
      });
    },
    1000 * 30,
  );

  it(
    'species?planter_id=1&limit=1',
    async () => {
      const response = await supertest(app).get(
        '/species?planter_id=1&limit=1',
      );
      expect(response.status).toBe(200);
      expect(response.body.species).toBeInstanceOf(Array);
      expect(response.body.species[0]).toMatchObject({
        total: expect.stringMatching(/\d+/),
        name: expect.any(String),
        id: expect.any(Number),
        desc: expect.any(String),
      });
    },
    1000 * 30,
  );

  it(
    'species?wallet_id=eecdf253-05b6-419a-8425-416a3e5fc9a0&limit=1',
    async () => {
      const response = await supertest(app).get(
        '/species?wallet_id=eecdf253-05b6-419a-8425-416a3e5fc9a0&limit=1',
      );
      expect(response.status).toBe(200);
      expect(response.body.species).toBeInstanceOf(Array);
      expect(response.body.species[0]).toMatchObject({
        total: expect.stringMatching(/\d+/),
        name: expect.any(String),
        id: expect.any(Number),
        desc: expect.any(String),
      });
    },
    1000 * 30,
  );
});
