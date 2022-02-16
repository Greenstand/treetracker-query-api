import supertest from 'supertest';
import app from '../../server/app';

describe('transactions', () => {
  it('get transactions', async () => {
    const response = await supertest(app).get('/transactions');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      total: 2,
      limit: 20,
      offset: 0,
      transactions: expect.arrayContaining([
        expect.objectContaining({ id: '1e36679e-eb5d-48ed-adf7-be61d11e709b' }),
        expect.objectContaining({ id: '3bdc013c-3bd8-466c-9604-8490981e80f4' }),
      ]),
    });
  });

  it('get transactions associated with wallet_id', async () => {
    const response = await supertest(app).get(
      '/transactions?wallet_id=ca851239-ed14-492e-9a19-0269c6405dfd',
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      total: 2,
      limit: 20,
      offset: 0,
      transactions: expect.arrayContaining([
        expect.objectContaining({ id: '3bdc013c-3bd8-466c-9604-8490981e80f4' }),
        expect.objectContaining({ id: '1e36679e-eb5d-48ed-adf7-be61d11e709b' }),
      ]),
    });
  });

  it('get transactions associated with token_id', async () => {
    const response = await supertest(app).get(
      '/transactions?token_id=69632058-5ef2-4b60-85e0-c0389e502904',
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      total: 2,
      limit: 20,
      offset: 0,
      transactions: expect.arrayContaining([
        expect.objectContaining({ id: '1e36679e-eb5d-48ed-adf7-be61d11e709b' }),
        expect.objectContaining({ id: '3bdc013c-3bd8-466c-9604-8490981e80f4' }),
      ]),
    });
  });

  it(`token_id supercedes wallet_id that doesn't exist if both are passed`, async () => {
    const response = await supertest(app).get(
      '/transactions?wallet_id=c56a4180-65aa-42ec-a945-5fd21dec0538&token_id=69632058-5ef2-4b60-85e0-c0389e502904',
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      total: 2,
      limit: 20,
      offset: 0,
      transactions: expect.arrayContaining([
        expect.objectContaining({ id: '3bdc013c-3bd8-466c-9604-8490981e80f4' }),
        expect.objectContaining({ id: '1e36679e-eb5d-48ed-adf7-be61d11e709b' }),
      ]),
    });
  });

  it('token_id not found', async () => {
    const response = await supertest(app).get(
      '/transactions?token_id=c56a4180-65aa-42ec-a945-5fd21dec0538',
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      total: 0,
      limit: 20,
      offset: 0,
      transactions: [],
    });
  });

  it('wallet_id not found', async () => {
    const response = await supertest(app).get(
      '/transactions?wallet_id=c56a4180-65aa-42ec-a945-5fd21dec0538',
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      total: 0,
      limit: 20,
      offset: 0,
      transactions: [],
    });
  });

  it('wallet_id exists, but token_id does not', async () => {
    const response = await supertest(app).get(
      '/transactions?token_id=c56a4180-65aa-42ec-a945-5fd21dec0538&wallet_id=5c30d6f9-c6a5-4451-bc47-51f1b25e44ef',
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      total: 0,
      limit: 20,
      offset: 0,
      transactions: [],
    });
  });
});
