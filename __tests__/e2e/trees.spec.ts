import exampleTree from '@mocks/trees/912681.json';
import supertest from 'supertest';
import app from 'app';

it('trees/{id}', async () => {
  const response = await supertest(app).get(`/trees/${exampleTree.id}`);
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    id: exampleTree.id,
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

it.skip(
  'Get tree by organization id',
  async () => {
    const organization_id = exampleTree.planting_organization_id;
    const response = await supertest(app).get(
      `/trees?limit=1&organization_id=${organization_id}`,
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      trees: expect.anything(),
    });
    expect(response.body.trees[0]).toMatchObject({
      organization_id,
    });
  },
  1000 * 60,
);

it.skip(
  'trees/featured',
  async () => {
    const response = await supertest(app).get('/trees/featured');
    expect(response.status).toBe(200);
    expect(response.body.trees[0]).toMatchObject({
      id: expect.any(Number),
    });
  },
  1000 * 10,
);
