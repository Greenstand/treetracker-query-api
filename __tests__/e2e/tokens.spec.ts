import supertest from 'supertest';
import app from '../../server/app';

describe('Tokens', () => {
  it('/tokens/{tokenId}', async () => {
    const response = await supertest(app).get(
      '/tokens/125ce23f-e0e5-4b2b-84e8-6340cd158afd',
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: '125ce23f-e0e5-4b2b-84e8-6340cd158afd',
      capture_id: '6b0de333-c61d-4094-adfb-d34a0ad15cf6',
      wallet_id: 'eecdf253-05b6-419a-8425-416a3e5fc9a0',
      transfer_pending: false,
      transfer_pending_id: null,
      claim: false,
      tree_id: 951896,
      tree_species_name: 'apple',
    });
  });

  it('/tokens?wallet=bd60973b-2f08-45c5-afb3-7ec018180f17', async () => {
    const response = await supertest(app).get(
      '/tokens?wallet=bd60973b-2f08-45c5-afb3-7ec018180f17',
    );

    expect(response.status).toBe(200);
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
    expect(response.body).toMatchObject({
      tokens: expect.anything(),
    });

    for (let i = 0; i < response.body.tokens.length; i++) {
      expect(response.body.tokens[i]).toMatchObject({
        wallet_id: 'eecdf253-05b6-419a-8425-416a3e5fc9a0',
      });
    }
  });

  it('/tokens?wallet=Dave.Mertz68&withPlanter=true&withCapture=false', async () => {
    const response = await supertest(app).get(
      '/tokens?wallet=Dave.Mertz68&withPlanter=true&withCapture=false',
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      tokens: expect.anything(),
    });

    for (let i = 0; i < response.body.tokens.length; i++) {
      expect(response.body.tokens[i]).toMatchObject({
        wallet_id: 'bd60973b-2f08-45c5-afb3-7ec018180f17',
        planter_first_name: 'Tristin',
        planter_last_name: 'Hills',
        planter_id: 5429,
      });
    }

    for (let i = 0; i < response.body.tokens.length; i++) {
      expect(response.body.tokens[i].capture_photo_url).toBeUndefined();
    }
  });

  it('/tokens?wallet=Dave.Mertz68&withPlanter=true&withCapture=true', async () => {
    const response = await supertest(app).get(
      '/tokens?wallet=Dave.Mertz68&withPlanter=true&withCapture=true',
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      tokens: expect.anything(),
    });

    for (let i = 0; i < response.body.tokens.length; i++) {
      expect(response.body.tokens[i]).toMatchObject({
        wallet_id: 'bd60973b-2f08-45c5-afb3-7ec018180f17',
        planter_first_name: 'Tristin',
        planter_last_name: 'Hills',
        planter_id: 5429,
      });
    }

    expect(response.body.tokens[0]).toMatchObject({
      wallet_id: 'bd60973b-2f08-45c5-afb3-7ec018180f17',
      planter_first_name: 'Tristin',
      planter_last_name: 'Hills',
      planter_id: 5429,
      capture_id: '60f2fa61-03ce-4895-8ae8-2987be0ddccb',
    });
  });
});
