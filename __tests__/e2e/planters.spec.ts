import supertest from 'supertest';
import app from '../../server/app';

describe("planters", () => {

  it("planters/{id}", async () => {
    const response = await supertest(app).get("/planters/1");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 1,
    });
  })

  it("planters?organization_id=1&limit=1", async () => {
    const response = await supertest(app).get("/planters?organization_id=1&limit=1");
    expect(response.status).toBe(200);
    expect(response.body.trees).toBeInstanceOf(Array);
    expect(response.body.trees[0]).toMatchObject({
      id: 1,
      organization_id: 1,
      featured_trees: expect.stringMatching(/trees/),
    })
  }, 1000 * 30)


})