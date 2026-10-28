import mockDb from 'mock-knex';
import FilterOptions from 'interfaces/FilterOptions';
import GrowerAccountFilter from 'interfaces/GrowerAccountFilter';
import GrowerAccountRepository from './GrowerAccountRepository';
import Session from './Session';

function withTracker(
  callback: (
    session: Session,
    tracker: ReturnType<typeof mockDb.getTracker>,
  ) => Promise<void>,
): Promise<void> {
  const session = new Session();
  const db = session.getDB();
  mockDb.mock(db);
  const tracker = mockDb.getTracker();
  tracker.install();

  return callback(session, tracker).finally(() => {
    tracker.uninstall();
    mockDb.unmock(db);
  });
}

describe('GrowerAccountRepository query plans', () => {
  it('counts from the grower table without one-to-many joins or DISTINCT', async () => {
    await withTracker(async (session, tracker) => {
      tracker.on('query', (query) => {
        expect(query.sql).toMatch(/count\(\*\) as count/i);
        expect(query.sql).toMatch(/from treetracker\.grower_account/i);
        expect(query.sql).not.toMatch(/count\(distinct/i);
        expect(query.sql).not.toContain('treetracker"."capture');
        expect(query.sql).not.toContain('field_data"."device_configuration');
        query.response([{ count: '12' }]);
      });

      const repository = new GrowerAccountRepository(session);
      const result = await repository.getCount({
        organization_id: ['org-1'],
        wallet: 'wallet',
      } as GrowerAccountFilter);

      expect(result).toEqual({ count: '12' });
    });
  });

  it('uses pre-aggregated list joins without DISTINCT ON', async () => {
    await withTracker(async (session, tracker) => {
      tracker.on('query', (query) => {
        expect(query.sql).not.toMatch(/distinct on/i);
        expect(query.sql).not.toMatch(
          /left join "treetracker"\."capture" as "tc"/i,
        );
        expect(query.sql).toContain('captures_count');
        expect(query.sql).toMatch(/limit \$\d+/i);
        expect(query.sql).toMatch(/offset \$\d+/i);
        query.response([]);
      });

      const repository = new GrowerAccountRepository(session);
      const result = await repository.getByFilter(
        {
          captures_amount_min: 2,
          device_identifier: 'device',
        } as GrowerAccountFilter,
        { limit: 20, offset: 40 } as FilterOptions,
      );

      expect(result).toEqual([]);
    });
  });

  it('keeps capture and device filters correlated to the grower id', async () => {
    await withTracker(async (session, tracker) => {
      tracker.on('query', (query) => {
        expect(query.sql).toMatch(/exists/i);
        expect(query.sql).toContain('tc_filter.grower_account_id');
        expect(query.sql).toMatch(/count\(\*\) from treetracker\.capture/i);
        expect(query.sql).toContain('device_identifier');
        expect(query.bindings).toContain('%device%');
        expect(query.bindings).toContain(2);
        query.response([]);
      });

      const repository = new GrowerAccountRepository(session);
      await repository.getByFilter(
        {
          captures_amount_min: 2,
          device_identifier: 'device',
        } as GrowerAccountFilter,
        { limit: 10 } as FilterOptions,
      );
    });
  });
});
