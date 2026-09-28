import mockDb from 'mock-knex';
import BoundsRepository from './BoundsRepository';
import Session from './Session';

describe('BoundsRepository initial bounds points', () => {
  const session = new Session();
  const repository = new BoundsRepository(session);
  const tracker = mockDb.getTracker();

  beforeEach(() => {
    mockDb.mock(session.getDB());
    tracker.install();
  });

  afterEach(() => {
    tracker.uninstall();
    mockDb.unmock(session.getDB());
  });

  it('uses parameterized wallet filtering', async () => {
    tracker.on('query', (query) => {
      expect(query.sql).toContain('tk.wallet_id::text = $1');
      expect(query.bindings).toEqual(['wallet-name']);
      query.response({ rows: [{ lat: '10', lon: '179.8' }, { lat: '10.2', lon: '-179.8' }] });
    });
    await expect(repository.getInitialBoundsPoints({ wallet_id: 'wallet-name' })).resolves.toEqual([
      { lat: 10, lon: 179.8 },
      { lat: 10.2, lon: -179.8 },
    ]);
  });

  it('returns an empty point set for an entity with no trees', async () => {
    tracker.on('query', (query) => query.response({ rows: [] }));
    await expect(repository.getInitialBoundsPoints({ organisation_id: '42' })).resolves.toEqual([]);
  });
});
