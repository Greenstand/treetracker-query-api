import supertest from 'supertest';
import app from '../../server/app';

describe("organizations", () => {

  it("organizations/{id}", async () => {
    const response = await supertest(app).get("/organizations/1");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 1,
    });
  })

  it("organizations?planter_id=1&limit=1", async () => {
    const response = await supertest(app).get("/organizations?planter_id=1&limit=1");
    expect(response.status).toBe(200);
    expect(response.body.organizations).toBeInstanceOf(Array);
    expect(response.body.organizations[0]).toMatchObject({
      id: expect.any(Number),
    })
  }, 1000 * 30)

})