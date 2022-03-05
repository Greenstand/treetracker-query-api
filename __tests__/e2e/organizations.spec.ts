import exampleOrganization from '@mocks/organizations/exampleOrganization.json';
import examplePlanter from '@mocks/planters/examplePlanter.json';
import supertest from 'supertest';
import app from 'app';

it('organizations/{id}', async () => {
  const response = await supertest(app).get(
    `/organizations/${exampleOrganization.id}`,
  );
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    id: exampleOrganization.id,
    links: {
      featured_trees: expect.stringMatching(/trees/),
      associated_planters: expect.stringMatching(/planters/),
      species: expect.stringMatching(/species/),
    },
  });
});

it(
  'organizations?planter_id=1&limit=1',
  async () => {
    const response = await supertest(app).get(
      `/organizations?planter_id=${examplePlanter.id}&limit=1`,
    );
    expect(response.status).toBe(200);
    expect(response.body.organizations).toBeInstanceOf(Array);
    expect(response.body.organizations[0]).toMatchObject({
      id: expect.any(Number),
      links: {
        featured_trees: expect.stringMatching(/trees/),
        associated_planters: expect.stringMatching(/planters/),
        species: expect.stringMatching(/species/),
      },
    });
  },
  1000 * 30,
);
