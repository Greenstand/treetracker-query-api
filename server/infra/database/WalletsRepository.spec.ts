import mockDb from 'mock-knex';
import HttpError from 'utils/HttpError';
import Session from './Session';
import WalletsRepository from './WalletsRepository';

jest.mock('./patch', () => ({
  __esModule: true,
  default: jest.fn((value) => Promise.resolve(value)),
  PATCH_TYPE: {
    EXTRA_WALLET: 'EXTRA_WALLET',
  },
}));

describe('WalletsRepository', () => {
  const session = new Session();
  const repo = new WalletsRepository(session);
  // eslint-disable-next-line
  var tracker = require('mock-knex').getTracker();

  beforeEach(() => {
    mockDb.mock(session.getDB());
    tracker.install();
  });

  afterEach(() => {
    tracker.uninstall();
    mockDb.unmock(session.getDB());
  });

  it('getWalletByIdOrName', async () => {
    tracker.on('query', (query) => {
      expect(query.sql).toMatch(/FROM\s+wallet\.wallet/i);
      expect(query.sql).toMatch(/name = 'test-wallet-03'/);
      query.response({
        rows: [
          {
            id: '0faf4970-ac66-4bbc-a68a-c1e1881211fc',
            name: 'test-wallet-03',
            logo_url: null,
            created_at: '2024-12-06T04:35:55.165Z',
            about: null,
          },
        ],
      });
    });

    const result = await repo.getWalletByIdOrName('test-wallet-03');
    expect(result).toMatchObject({
      id: '0faf4970-ac66-4bbc-a68a-c1e1881211fc',
      name: 'test-wallet-03',
    });
  });

  it('getWalletByIdOrName should throw 404 when wallet is missing', async () => {
    tracker.on('query', (query) => {
      expect(query.sql).toMatch(/FROM\s+wallet\.wallet/i);
      expect(query.sql).toMatch(/name = 'dadiorchen'/);
      query.response({
        rows: [],
      });
    });

    await expect(repo.getWalletByIdOrName('dadiorchen')).rejects.toMatchObject({
      code: 404,
    } as Partial<HttpError>);
  });
});
