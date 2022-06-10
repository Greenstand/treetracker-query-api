import supertest from 'supertest';
import app from '../../server/app';

describe('Tokens', () => {
  it('/tokens/{tokenId}', async () => {
    const response = await supertest(app).get(
      '/tokens/24f4f5f7-c29e-4707-961a-3515be5a2f3e',
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: '24f4f5f7-c29e-4707-961a-3515be5a2f3e',
      capture_id: 'f6c0e710-d80a-4e93-a9d2-d4edb52856af',
      wallet_id: '01c75527-d9c3-437b-bf4b-167c60849e23',
      transfer_pending: false,
      transfer_pending_id: null,
      // created_at: '2021-02-18T23:53:29.172Z',
      // updated_at: '2021-02-18T23:53:29.172Z',
      claim: false,
    });
  });

  it('/tokens?wallet=bd60973b-2f08-45c5-afb3-7ec018180f17', async () => {
    const response = await supertest(app).get(
      '/tokens?wallet=bd60973b-2f08-45c5-afb3-7ec018180f17',
    );

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(10);
    expect(response.body).toMatchObject({
      tokens: expect.anything(),
    });

    expect(response.body.tokens[0]).toMatchObject({
      wallet_id: 'bd60973b-2f08-45c5-afb3-7ec018180f17',
    });

    expect(response.body.tokens[4]).toMatchObject({
      wallet_id: 'bd60973b-2f08-45c5-afb3-7ec018180f17',
    });

    expect(response.body.tokens[9]).toMatchObject({
      wallet_id: 'bd60973b-2f08-45c5-afb3-7ec018180f17',
    });
  });

  it('/tokens?wallet=Malinda51', async () => {
    const response = await supertest(app).get('/tokens?wallet=Malinda51');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(12);
    expect(response.body).toMatchObject({
      tokens: expect.anything(),
    });

    expect(response.body.tokens[0]).toMatchObject({
      wallet_id: 'eecdf253-05b6-419a-8425-416a3e5fc9a0',
    });

    expect(response.body.tokens[7]).toMatchObject({
      wallet_id: 'eecdf253-05b6-419a-8425-416a3e5fc9a0',
    });

    expect(response.body.tokens[11]).toMatchObject({
      wallet_id: 'eecdf253-05b6-419a-8425-416a3e5fc9a0',
    });
  });

  it('/tokens?wallet=Dave.Mertz68&withPlanter=true&withCapture=false', async () => {
    const response = await supertest(app).get(
      '/tokens?wallet=Dave.Mertz68&withPlanter=true&withCapture=false',
    );

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(10);
    expect(response.body).toMatchObject({
      tokens: expect.anything(),
    });

    expect(response.body.tokens[0]).toMatchObject({
      wallet_id: 'bd60973b-2f08-45c5-afb3-7ec018180f17',
      planter_first_name: 'Tristin',
      planter_last_name: 'Hills',
      planter_id: 5429,
    });

    expect(response.body.tokens[4]).toMatchObject({
      wallet_id: 'bd60973b-2f08-45c5-afb3-7ec018180f17',
      planter_first_name: 'Tristin',
      planter_last_name: 'Hills',
      planter_id: 5429,
    });
  });

  it('/tokens?wallet=Dave.Mertz68&withPlanter=true&withCapture=true', async () => {
    const response = await supertest(app).get(
      '/tokens?wallet=Dave.Mertz68&withPlanter=true&withCapture=true',
    );

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(10);
    expect(response.body).toMatchObject({
      tokens: expect.anything(),
    });

    expect(response.body.tokens[0]).toMatchObject({
      wallet_id: 'bd60973b-2f08-45c5-afb3-7ec018180f17',
      planter_first_name: 'Tristin',
      planter_last_name: 'Hills',
      planter_id: 5429,
      capture_id: '60f2fa61-03ce-4895-8ae8-2987be0ddccb',
    });

    expect(response.body.tokens[4]).toMatchObject({
      wallet_id: 'bd60973b-2f08-45c5-afb3-7ec018180f17',
      planter_first_name: 'Tristin',
      planter_last_name: 'Hills',
      planter_id: 5429,
      capture_id: 'a11b111f-03e3-4232-94ca-fb4925448ce4',
    });
  });
});
