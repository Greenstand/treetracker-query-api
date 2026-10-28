export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface BoundingBoxCorners {
  southWest: GeoPoint;
  northEast: GeoPoint;
}

export interface EntityBoundsResult {
  bounds: BoundingBoxCorners;
  center: GeoPoint;
  suggestedZoom: number;
  totalTrees: number;
  crossesAntimeridian: boolean;
}

export interface Viewport {
  width: number;
  height: number;
}

const DEFAULT_VIEWPORT: Viewport = { width: 800, height: 600 };
const DEFAULT_PADDING_DEGREES = 0.005;
const DEFAULT_SINGLE_POINT_ZOOM = 15;
const MIN_ZOOM = 2;
const MAX_ZOOM = 17;

function normalizeLongitude(lon: number): number {
  return ((lon + 180) % 360 + 360) % 360 - 180;
}

function zoomForSpan(latSpan: number, lonSpan: number, viewport: Viewport): number {
  const safeLatSpan = Math.max(latSpan, 0.0001);
  const safeLonSpan = Math.max(lonSpan, 0.0001);
  const latitudeZoom = Math.log2((180 * viewport.height) / (256 * safeLatSpan));
  const longitudeZoom = Math.log2((360 * viewport.width) / (256 * safeLonSpan));
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.floor(Math.min(latitudeZoom, longitudeZoom))));
}

function paddedBounds(point: GeoPoint): BoundingBoxCorners {
  return {
    southWest: { lat: Math.max(-90, point.lat - DEFAULT_PADDING_DEGREES), lon: Math.max(-180, point.lon - DEFAULT_PADDING_DEGREES) },
    northEast: { lat: Math.min(90, point.lat + DEFAULT_PADDING_DEGREES), lon: Math.min(180, point.lon + DEFAULT_PADDING_DEGREES) },
  };
}

function longitudeArc(longitudes: number[]): { start: number; end: number; span: number; crossesAntimeridian: boolean } {
  const sorted = Array.from(new Set(longitudes.map(normalizeLongitude))).sort((a, b) => a - b);
  if (sorted.length === 1) return { start: sorted[0], end: sorted[0], span: 0, crossesAntimeridian: false };

  let largestGap = -1;
  let gapStartIndex = 0;
  for (let index = 0; index < sorted.length; index += 1) {
    const next = (index + 1) % sorted.length;
    const nextLongitude = next === 0 ? sorted[0] + 360 : sorted[next];
    const gap = nextLongitude - sorted[index];
    if (gap > largestGap) {
      largestGap = gap;
      gapStartIndex = index;
    }
  }
  const start = sorted[(gapStartIndex + 1) % sorted.length];
  const end = sorted[gapStartIndex];
  return { start, end, span: Math.max(0, 360 - largestGap), crossesAntimeridian: start > end };
}

export function calculateEntityBounds(points: GeoPoint[], viewport: Viewport = DEFAULT_VIEWPORT): EntityBoundsResult | null {
  const validPoints = points.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon) && point.lat >= -90 && point.lat <= 90 && point.lon >= -180 && point.lon <= 180);
  if (validPoints.length === 0) return null;
  if (!Number.isFinite(viewport.width) || viewport.width <= 0 || !Number.isFinite(viewport.height) || viewport.height <= 0) throw new Error('Viewport dimensions must be positive finite numbers');

  const latitudes = validPoints.map((point) => point.lat);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const arc = longitudeArc(validPoints.map((point) => point.lon));
  const center: GeoPoint = { lat: (minLat + maxLat) / 2, lon: normalizeLongitude(arc.start + arc.span / 2) };
  const isSinglePoint = validPoints.length === 1;
  const bounds = isSinglePoint ? paddedBounds(validPoints[0]) : { southWest: { lat: minLat, lon: arc.start }, northEast: { lat: maxLat, lon: arc.end } };
  const latSpan = isSinglePoint ? DEFAULT_PADDING_DEGREES * 2 : maxLat - minLat;
  const lonSpan = isSinglePoint ? DEFAULT_PADDING_DEGREES * 2 : arc.span;
  return {
    bounds,
    center,
    suggestedZoom: isSinglePoint ? DEFAULT_SINGLE_POINT_ZOOM : zoomForSpan(latSpan, lonSpan, viewport),
    totalTrees: validPoints.length,
    crossesAntimeridian: !isSinglePoint && arc.crossesAntimeridian,
  };
}
