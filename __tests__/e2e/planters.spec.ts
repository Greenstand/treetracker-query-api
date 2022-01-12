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