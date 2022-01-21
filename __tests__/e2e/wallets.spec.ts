import supertest from 'supertest';
import app from '../../server/app';

describe('wallets', () => {
  it('wallets/0248f77a-1531-11ec-82a8-0242ac130003', async () => {
    const response = await supertest(app).get(
      '/wallets/0248f77a-1531-11ec-82a8-0242ac130003',
    );
    expect(response.status).toBe(200);
    console.log(response.body);
    expect(response.body).toMatchObject({
      id: '0248f77a-1531-11ec-82a8-0242ac130003',
      name: '180Earth',
      token_in_wallet: 22,
      photo_url: 'https://180.earth/wp-content/uploads/2020/01/Asset-1.png',
    });
  });
});
