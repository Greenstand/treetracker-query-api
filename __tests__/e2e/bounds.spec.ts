import supertest from 'supertest';
import app from '../../server/app';
import BoundsRepository from '../../server/infra/database/BoundsRepository';

describe('testing bounds route', () => {
  it('returns calculated initial bounds for a wallet', async () => {
    const pointsSpy = jest
      .spyOn(BoundsRepository.prototype, 'getInitialBoundsPoints')
      .mockResolvedValue([
        { lat: 10, lon: 179.8 },
        { lat: 10.2, lon: -179.8 },
      ]);
    const response = await supertest(app).get('/bounds/initial?wallet_id=sample-wallet');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body.bounds.totalTrees).toBe(2);
    expect(response.body.bounds.crossesAntimeridian).toBe(true);
    expect(response.body.bounds.bounds.southWest.lat).toBeCloseTo(10, 8);
    expect(response.body.bounds.bounds.southWest.lon).toBeCloseTo(179.8, 8);
    expect(response.body.bounds.bounds.northEast.lat).toBeCloseTo(10.2, 8);
    expect(response.body.bounds.bounds.northEast.lon).toBeCloseTo(-179.8, 8);
    pointsSpy.mockRestore();
  });

  it('returns a null result for an entity with no trees', async () => {
    const pointsSpy = jest
      .spyOn(BoundsRepository.prototype, 'getInitialBoundsPoints')
      .mockResolvedValue([]);
    const response = await supertest(app).get('/bounds/initial?organisation_id=42');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ bounds: null });
    pointsSpy.mockRestore();
  });

  it('requires exactly one entity filter', async () => {
    const response = await supertest(app).get('/bounds/initial');
    expect(response.status).toBe(422);
  });

  it('bounds for planter', async () => {
    const response = await supertest(app).get('/bounds/?planter_id=5838');
    expect(response.status).toBe(200);
    const { bounds } = response.body;
    expect(bounds.ne).toBeInstanceOf(Array);
    expect(bounds.se).toBeInstanceOf(Array);
  });

  it('bounds for organisation', async () => {
    const response = await supertest(app).get('/bounds/?organisation_id=30');
    expect(response.status).toBe(200);
    const { bounds } = response.body;
    expect(bounds.ne).toBeInstanceOf(Array);
    expect(bounds.se).toBeInstanceOf(Array);
  });
});
