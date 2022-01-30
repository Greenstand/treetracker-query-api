import supertest from 'supertest';
import app from '../../server/app';

describe('wallets', () => {
  it('get wallet by id or name', async () => {
    const response = await supertest(app).get(
      '/wallets/88a33d5b-5c47-4a32-8572-0899817d3f38',
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: '88a33d5b-5c47-4a32-8572-0899817d3f38',
      name: 'NewWalletByAutoTool_49836',
      password: null,
      salt: null,
      logo_url: null,
      created_at: '2021-10-08T02:33:20.732Z',
    });
  });
});
