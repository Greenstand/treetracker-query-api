import exampleOrganizations from '@mocks/organizations/exampleOrganization.json';
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

it(
  'planters?organization_id=1&limit=1',
  async () => {
    const response = await supertest(app).get(
      `/planters?organization_id=${exampleOrganizations.id}&limit=1`,
    );
    expect(response.status).toBe(200);
    expect(response.body.planters).toBeInstanceOf(Array);
    expect(response.body.planters[0]).toMatchObject({
      id: examplePlanter.id,
      organization_id: exampleOrganizations.id,
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
