import exampleWallet from '@mocks/wallets/exampleWallet.json';
import supertest from 'supertest';
import app from '../../server/app';

it('get wallet by id or name', async () => {
  const { id, name } = exampleWallet;
  const response = await supertest(app).get(`/wallets/${id}`);
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    id: exampleWallet.id,
    name,
    password: null,
    salt: null,
    logo_url: null,
    // created_at: '2021-10-08T02:33:20.732Z',
  });
});
