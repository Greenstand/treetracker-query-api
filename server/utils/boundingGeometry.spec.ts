import { calculateEntityBounds } from './boundingGeometry';

describe('calculateEntityBounds', () => {
  it('calculates a tight localized box and a bounded zoom', () => {
    const result = calculateEntityBounds([
      { lat: 8.48, lon: -13.27 },
      { lat: 8.481, lon: -13.269 },
      { lat: 8.482, lon: -13.268 },
    ]);
    expect(result).not.toBeNull();
    expect(result?.bounds.southWest.lat).toBeCloseTo(8.48, 8);
    expect(result?.bounds.southWest.lon).toBeCloseTo(-13.27, 8);
    expect(result?.bounds.northEast.lat).toBeCloseTo(8.482, 8);
    expect(result?.bounds.northEast.lon).toBeCloseTo(-13.268, 8);
    expect(result?.crossesAntimeridian).toBe(false);
    expect(result?.suggestedZoom).toBeGreaterThanOrEqual(2);
    expect(result?.suggestedZoom).toBeLessThanOrEqual(17);
  });

  it('uses the shortest circular arc across the antimeridian', () => {
    const result = calculateEntityBounds([
      { lat: 10, lon: 179.8 },
      { lat: 10.2, lon: -179.8 },
    ]);
    expect(result?.crossesAntimeridian).toBe(true);
    expect(result?.bounds.southWest.lon).toBeCloseTo(179.8, 8);
    expect(result?.bounds.northEast.lon).toBeCloseTo(-179.8, 8);
    expect(Math.abs(result?.center.lon ?? 0)).toBeCloseTo(180, 8);
    expect(result?.suggestedZoom).toBeGreaterThan(8);
  });

  it('pads a singleton without producing an invalid zoom', () => {
    const result = calculateEntityBounds([{ lat: 0, lon: 0 }]);
    expect(result?.bounds.southWest).toEqual({ lat: -0.005, lon: -0.005 });
    expect(result?.bounds.northEast).toEqual({ lat: 0.005, lon: 0.005 });
    expect(result?.suggestedZoom).toBe(15);
    expect(Number.isFinite(result?.suggestedZoom)).toBe(true);
  });

  it('returns null for an empty or invalid entity', () => {
    expect(calculateEntityBounds([])).toBeNull();
    expect(calculateEntityBounds([{ lat: Number.NaN, lon: 0 }])).toBeNull();
  });

  it('rejects invalid viewport dimensions', () => {
    expect(() => calculateEntityBounds([{ lat: 1, lon: 1 }], { width: 0, height: 600 })).toThrow(/Viewport/);
  });
});
