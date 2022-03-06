import exampleOrganization from '@seeds/data/organization.json';
import examplePlanter from '@seeds/data/planter.json';
import exampleSpecies from '@seeds/data/species.json';
import supertest from 'supertest';
import app from 'app';

it('species/{id}', async () => {
  const response = await supertest(app).get(`/species/${exampleSpecies.id}`);
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
      `/species?organization_id=${exampleOrganization.id}&limit=1`,
    );
    expect(response.status).toBe(200);
    expect(response.body.species).toBeInstanceOf(Array);
    expect(response.body.species[0]).toMatchObject({
      total: expect.stringMatching(/\d+/),
      name: expect.any(String),
      id: expect.any(Number),
    });
  },
  1000 * 30,
);

it(
  'species?planter_id=1&limit=1',
  async () => {
    const response = await supertest(app).get(
      `/species?planter_id=${examplePlanter.id}&limit=1`,
    );
    expect(response.status).toBe(200);
    expect(response.body.species).toBeInstanceOf(Array);
    expect(response.body.species[0]).toMatchObject({
      total: expect.stringMatching(/\d+/),
      name: expect.any(String),
      id: expect.any(Number),
    });
  },
  1000 * 30,
);
