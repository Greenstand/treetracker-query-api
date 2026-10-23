import GisRepository from './GisRepository';
import Session from './Session';

function repositoryWithRawResult(rows = []) {
  const raw = jest.fn().mockResolvedValue({ rows });
  const session = {
    getDB: () => ({ raw }),
  } as unknown as Session;
  return { repository: new GisRepository(session), raw };
}

function expectParameterized(raw) {
  const [sql, bindings] = raw.mock.calls[0];
  expect((sql.match(/\?/g) || []).length).toBe(bindings.length);
  expect(sql).not.toMatch(/-15\.7237|46\.3511|heveya\.replant\.world/);
  return { sql, bindings };
}

describe('GisRepository.getNearest', () => {
  it('uses a GiST-friendly spatial pre-filter and bindings for wallet lookups', async () => {
    const { repository, raw } = repositoryWithRawResult([
      { st_asgeojson: '{"type":"Point","coordinates":[46.3511,-15.7237]}' },
    ]);

    const result = await repository.getNearest({
      zoom_level: '16',
      lat: '-15.7237',
      lng: '46.3511',
      wallet_id: 'heveya.replant.world',
    });

    const { sql, bindings } = expectParameterized(raw);
    expect(sql).toContain('trees.estimated_geometric_location && ST_Expand');
    expect(sql).toContain('wallet.wallet.name = ?');
    expect(sql).toContain('ORDER BY trees.estimated_geometric_location <->');
    expect(sql).not.toContain('ST_Extent');
    expect(bindings).toContain('heveya.replant.world');
    expect(result).toEqual({
      type: 'Point',
      coordinates: [46.3511, -15.7237],
    });
  });

  it('binds UUID, planter, organization, and map filters', async () => {
    const { repository, raw } = repositoryWithRawResult();
    const walletId = '123e4567-e89b-12d3-a456-426614174000';

    await repository.getNearest({
      zoom_level: 17,
      lat: 1,
      lng: 2,
      wallet_id: walletId,
      planter_id: 42,
      organization_id: 7,
      map_name: "org'; DROP TABLE trees; --",
    });

    const { sql, bindings } = expectParameterized(raw);
    expect(sql).toContain('wallet.token.wallet_id = ?');
    expect(sql).toContain('trees.planter_id = ?');
    expect(sql).toContain('getEntityRelationshipChildren(?)');
    expect(sql).toContain('entity WHERE map_name = ?');
    expect(bindings).toEqual([
      walletId,
      42,
      7,
      "org'; DROP TABLE trees; --",
      2,
      1,
      expect.any(Number),
      2,
      1,
    ]);
  });

  it('applies zoom-specific spatial pruning to cluster queries', async () => {
    const { repository, raw } = repositoryWithRawResult();

    await repository.getNearest({
      zoom_level: 12,
      lat: 10,
      lng: 20,
    });

    const { sql, bindings } = expectParameterized(raw);
    expect(sql).toContain('clusters.location && ST_Expand');
    expect(sql).toContain('ORDER BY clusters.location <->');
    expect(bindings).toEqual([20, 10, expect.any(Number), 20, 10]);
  });
});
