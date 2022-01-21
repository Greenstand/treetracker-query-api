import CountryModel from './Country';

describe('/wallets', () => {
  it('getWallets', async () => {
    const wallet = {
      id: '0248f77a-1531-11ec-82a8-0242ac130003',
      name: '180Earth',
      token_in_wallet: 22,
      photo_url: "'https://180.earth/wp-content/uploads/2020/01/Asset-1.png",
    };

    const repo: any = {
      getById: jest.fn(() => Promise.resolve(wallet)),
    };
    // @ts-ignore
    const execute = CountryModel.getById(repo);
    const result = await execute(1);
    expect(result).toMatchObject(result);
    expect(repo.getById).toBeCalledWith(1);
  });
});
