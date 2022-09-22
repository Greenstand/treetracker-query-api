import supertest from 'supertest';
import app from '../../server/app';

describe('planters', () => {
  it(
    'planters/{id}',
    async () => {
      const response = await supertest(app).get('/planters/3564');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 3564,
        continent_name: 'North America',
        country_name: 'Costa Rica',
        links: {
          featured_trees: expect.stringMatching(/trees/),
          associated_organizations: expect.stringMatching(/organizations/),
          species: expect.stringMatching(/species/),
        },
      });
    },
    1000 * 30,
  );

  it(
    'planters?organization_id=178&limit=1',
    async () => {
      const response = await supertest(app).get(
        '/planters?organization_id=178&limit=1',
      );
      expect(response.status).toBe(200);
      expect(response.body.planters).toBeInstanceOf(Array);
      expect(response.body.planters[0]).toMatchObject({
        id: 2001,
        organization_id: 178,
        links: {
          featured_trees: expect.stringMatching(/trees/),
          associated_organizations: expect.stringMatching(/organizations/),
          species: expect.stringMatching(/species/),
        },
      });
    },
    1000 * 30,
  );

  it('planters?keyword=da&limit=1', async () => {
    const response = await supertest(app).get('/planters?keyword=da&limit=1');
    expect(response.status).toBe(200);
    expect(response.body.planters).toBeInstanceOf(Array);
    expect(response.body.planters.length <= 1).toBe(true);
    expect(
      /^da/.test(response.body.planters[0].first_name) ||
        /^da/.test(response.body.planters[0].last_name),
    ).toBe(true);
  });

  it('planters/featured', async () => {
    const response = await supertest(app).get('/planters/featured');
    expect(response.status).toBe(200);
    expect(response.body.planters).toBeInstanceOf(Array);
    expect(response.body.planters.length === 10).toBe(true);
  });
});
