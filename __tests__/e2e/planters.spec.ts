import exampleOrganization from '@mocks/organizations/exampleOrganization.json';
import examplePlanter from '@mocks/planters/examplePlanter.json';
import supertest from 'supertest';
import app from 'app';

it('planters/{id}', async () => {
  const response = await supertest(app).get(`/planters/${examplePlanter.id}`);
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    id: examplePlanter.id,
    links: {
      featured_trees: expect.stringMatching(/trees/),
      associated_organizations: expect.stringMatching(/organizations/),
      species: expect.stringMatching(/species/),
    },
  });
});

// route is bugged: https://github.com/Greenstand/treetracker-query-api/issues/93
it.skip(
  'planters?organization_id=1&limit=1',
  async () => {
    const response = await supertest(app).get(
      `/planters?organization_id=${exampleOrganization.id}&limit=1`,
    );
    expect(response.status).toBe(200);
    expect(response.body.planters).toBeInstanceOf(Array);
    console.log(response.body.planters[0]);
    expect(response.body.planters[0]).toMatchObject({
      id: examplePlanter.id,
      organization_id: exampleOrganization.id,
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
  const keyword = examplePlanter.first_name.slice(0, 2);
  const response = await supertest(app).get(
    `/planters?keyword=${keyword}&limit=1`,
  );
  expect(response.status).toBe(200);
  expect(response.body.planters).toBeInstanceOf(Array);
  expect(response.body.planters.length <= 1).toBe(true);
  const regexp = RegExp(`^${keyword}`);
  expect(
    regexp.test(response.body.planters[0].first_name) ||
      regexp.test(response.body.planters[0].last_name),
  ).toBe(true);
});
