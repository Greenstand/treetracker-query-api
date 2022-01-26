import WalletsModel from './Wallets';

describe('/wallet', () => {
  it('get wallet by id or name', async () => {
    const wallets = {
      id: '88a33d5b-5c47-4a32-8572-0899817d3f38',
      name: 'NewWalletByAutoTool_49836',
      password: null,
      salt: null,
      logo_url: null,
      created_at: '2021-10-08T02:33:20.732Z',
    };
    const repo: any = {
      getByIdOrName: jest.fn(() => Promise.resolve(wallets)),
    };
    // @ts-ignore
    const execute = WalletsModel.getByIdOrName(repo);
    const result = await execute(1);
    expect(result).toMatchObject(wallets);
    expect(repo.getByIdOrName).toBeCalledWith(1);
  });
});
