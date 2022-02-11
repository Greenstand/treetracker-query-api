import TokensModel from './tokens';

describe('Tokens', () => {
  it('get token by id ', async () => {
    const token = {
      id: '24f4f5f7-c29e-4707-961a-3515be5a2f3e',
      capture_id: 'f6c0e710-d80a-4e93-a9d2-d4edb52856af',
      wallet_id: 'eecdf253-05b6-419a-8425-416a3e5fc9a0',
      transfer_pending: false,
      transfer_pending_id: null,
      created_at: '2021-02-18T23:53:29.172Z',
      updated_at: '2021-02-18T23:53:29.172Z',
      claim: false,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repo: any = {
      getById: jest.fn(() => Promise.resolve(token)),
    };

    const execute = TokensModel.getById(repo);
    const result = await execute(1);
    expect(result).toMatchObject(token);
    expect(repo.getById).toBeCalledWith(1);
  });
});
