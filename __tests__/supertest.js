/*
 * The integration test to test the whole microservice, with DB
 */
require('dotenv').config()
const request = require('supertest');
const server = require("../server/app");
const { expect } = require('chai');
const seed = require('./seed');
const log = require('loglevel');
const sinon = require("sinon");

describe('microservice integration tests', () => {

  beforeEach(async () => {
    //In case other sinon stub would affect me 
    sinon.restore();
    //before all, seed data to DB
    await seed.clear();
    await seed.seed();

    // do any other setup here
    // including authorize to the service if required
  });

  afterEach(done => {
    //after finished all the test, clear data from DB
    seed.clear()
      .then(() => {
        done();
      });
  });

  describe("Does something", () => {

    it(`Should do something and not fail`, async () => {
      const res = await request(server)
        .get(`/path`)
      expect(res).to.have.property('statusCode', 200);
    });

  
  });

});

