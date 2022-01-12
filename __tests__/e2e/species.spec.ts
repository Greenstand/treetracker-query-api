import supertest from 'supertest';
import app from '../../server/app';

describe("species", () => {

  it("species/{id}", async () => {
    const response = await supertest(app).get("/species/8");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 8,
      name: expect.any(String),
    });
  })

  it("species?organization_id=1&limit=1", async () => {
    const response = await supertest(app).get("/species?organization_id=1&limit=1");
    expect(response.status).toBe(200);
    expect(response.body.trees).toBeInstanceOf(Array);
    expect(response.body.trees[0]).toMatchObject({
      total: expect.stringMatching(/\d+/),
      name: expect.any(String),
      id: expect.any(Number),
    })
  }, 1000 * 30)

  it("species?planter_id=1&limit=1", async () => {
    const response = await supertest(app).get("/species?planter_id=1&limit=1");
    expect(response.status).toBe(200);
    expect(response.body.trees).toBeInstanceOf(Array);
    expect(response.body.trees[0]).toMatchObject({
      total: expect.stringMatching(/\d+/),
      name: expect.any(String),
      id: expect.any(Number),
    })
  }, 1000 * 30)

  // it("trees?limit=1&offset=0", async () => {
  //   const response = await supertest(app).get("/trees?limit=1&offset=0");
  //   expect(response.status).toBe(200);
  //   expect(response.body).toMatchObject({
  //     trees: expect.anything(),
  //   });
  // });

  // it("trees?limit=1&organization_id=11", async () => {
  //   const response = await supertest(app).get("/trees?limit=1&organization_id=11");
  //   expect(response.status).toBe(200);
  //   expect(response.body).toMatchObject({
  //     trees: expect.anything(),
  //   });
  //   expect(response.body.trees[0]).toMatchObject({
  //     organization_id: 11,
  //   });
  // }, 1000*60);

  // it("trees/featured", async () => {
  //   const response = await supertest(app).get("/trees/featured");
  //   expect(response.status).toBe(200);
  //   // expect(response.body).toMatchObject({
  //   //   trees: expect.anything(),
  //   // });
  //   expect(response.body.trees[0]).toMatchObject({
  //     id: expect.any(Number),
  //   });
  // }, 1000*10);

})