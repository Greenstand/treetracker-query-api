import Session from './Session';

const METERS_PER_DEGREE = 111_320;

function searchRadiusDegrees(zoomLevel: number) {
  if (zoomLevel <= 11) {
    return 20;
  }
  if (zoomLevel < 15) {
    return 5;
  }
  return 10_000 / METERS_PER_DEGREE;
}

export default class GisRepository {
  session: Session;

  constructor(session: Session) {
    this.session = session;
  }

  async getNearest(params): Promise<unknown> {
    const zoomLevel = Number.parseInt(params.zoom_level, 10);
    const lng = Number.parseFloat(params.lng);
    const lat = Number.parseFloat(params.lat);

    if (
      !Number.isFinite(zoomLevel) ||
      !Number.isFinite(lng) ||
      !Number.isFinite(lat)
    ) {
      throw new Error('zoom_level, lng and lat must be valid numbers');
    }

    const bindings: Array<number | string> = [];
    const point = () => {
      bindings.push(lng, lat);
      return 'ST_SetSRID(ST_MakePoint(?, ?), 4326)';
    };
    const radius = searchRadiusDegrees(zoomLevel);
    const spatialColumn =
      zoomLevel <= 11
        ? 'active_tree_region.centroid'
        : zoomLevel < 15
        ? 'clusters.location'
        : 'trees.estimated_geometric_location';
    const spatialFilter = () => {
      const pointSql = point();
      bindings.push(radius);
      return `${spatialColumn} && ST_Expand(${pointSql}, ?)`;
    };

    let sql: string;
    if (zoomLevel <= 11) {
      bindings.push(zoomLevel);
      sql = `
        SELECT ST_AsGeoJSON(centroid) AS st_asgeojson
        FROM active_tree_region
        WHERE zoom_level = ?
          AND ${spatialFilter()}
        ORDER BY ${spatialColumn} <-> ${point()}
        LIMIT 1;
      `;
    } else if (zoomLevel < 15) {
      sql = `
        SELECT ST_AsGeoJSON(location) AS st_asgeojson
        FROM clusters
        WHERE ${spatialFilter()}
        ORDER BY ${spatialColumn} <-> ${point()}
        LIMIT 1;
      `;
    } else {
      const joins: string[] = [];
      const filters: string[] = ['trees.active = true'];

      if (params.wallet_id) {
        joins.push(
          'JOIN wallet.token ON trees.uuid = wallet.token.capture_id::text',
          'JOIN wallet.wallet ON wallet.wallet.id = wallet.token.wallet_id',
        );
        if (/^[0-9a-f-]{36}$/i.test(params.wallet_id)) {
          filters.push('wallet.token.wallet_id = ?');
        } else {
          filters.push('wallet.wallet.name = ?');
        }
        bindings.push(params.wallet_id);
      }

      if (params.planter_id || params.organization_id || params.map_name) {
        joins.push('JOIN planter ON trees.planter_id = planter.id');
      }
      if (params.planter_id) {
        filters.push('trees.planter_id = ?');
        bindings.push(params.planter_id);
      }
      if (params.organization_id) {
        filters.push(
          'planter.organization_id IN ' +
            '(SELECT entity_id FROM getEntityRelationshipChildren(?))',
        );
        bindings.push(params.organization_id);
      }
      if (params.map_name) {
        filters.push(
          'planter.organization_id IN ' +
            '(SELECT entity_id FROM getEntityRelationshipChildren(' +
            '(SELECT id FROM entity WHERE map_name = ?)))',
        );
        bindings.push(params.map_name);
      }

      sql = `
        SELECT ST_AsGeoJSON(trees.estimated_geometric_location) AS st_asgeojson
        FROM trees
        ${joins.join('\n        ')}
        WHERE ${filters.join('\n          AND ')}
          AND ${spatialFilter()}
        ORDER BY ${spatialColumn} <-> ${point()}
        LIMIT 1;
      `;
    }

    const result = await this.session.getDB().raw(sql, bindings);
    // {"st_asgeojson":"{\"type\":\"Point\",\"coordinates\":[39.1089215842116,-5.12839483715479]}"}
    return result.rows.length > 0
      ? JSON.parse(result.rows[0].st_asgeojson)
      : null;
  }
}
