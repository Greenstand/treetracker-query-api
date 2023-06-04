import Bounds from 'interfaces/Bounds';
import HttpError from 'utils/HttpError';
import Session from './Session';

export default class GisRepository {
  session: Session;

  constructor(session: Session) {
    this.session = session;
  }

  async getNearest(params): Promise<unknown> {
    let { zoom_level, lng, lat } = params;
    zoom_level = parseInt(zoom_level);
    lng = parseFloat(lng);
    lat = parseFloat(lat);
    console.log('lng:', lng);
    let sql;
    if (zoom_level <= 11) {
      sql = `
    SELECT
      ST_ASGeoJson(centroid)
    FROM
      active_tree_region
    WHERE 
      zoom_level = ${zoom_level}
    ORDER BY
      active_tree_region.centroid <->
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}),4326)
    LIMIT 1;
    `;
    } else if (zoom_level < 15 && zoom_level > 11) {
      sql = `
  SELECT
    ST_ASGeoJson(location)
  FROM
    clusters
  ORDER BY
    location <->
    ST_SetSRID(ST_MakePoint(${lng}, ${lat}),4326)
  LIMIT 1;
    `;
    } else if (zoom_level >= 15) {
      sql = `
  WITH box AS (
      SELECT ST_Extent(ST_MakeLine(ST_Project(ST_SetSRID(ST_MakePoint(${lng}, ${lat}),4326), 10000, radians(45))::geometry, ST_Project(ST_SetSRID(ST_MakePoint(${lng}, ${lat}),4326), 10000, radians(225))::geometry)) AS geom
  )
  SELECT
    ST_ASGeoJson(estimated_geometric_location)
  FROM
    trees
  ${
    params.wallet_id
      ? 'join wallet.token on trees.uuid = wallet.token.capture_id::text join wallet.wallet on wallet.token.wallet_id = wallet.wallet.id '
      : ''
  }
  ${
    params.organization_id || params.map_name
      ? 'join planter on trees.planter_id = planter.id'
      : ''
  }
  WHERE
    active = true
  ${
    params.wallet_id
      ? /[0-9a-f-]{36}/.test(params.wallet_id)
        ? `and wallet.token.wallet_id = '${params.wallet_id}' `
        : `and wallet.wallet.name = '${params.wallet_id}'`
      : ''
  }
  ${params.planter_id ? `and planter_id = ${params.planter_id}` : ''}
  ${
    params.organization_id
      ? `and planter.organization_id in ( SELECT entity_id from getEntityRelationshipChildren(${params.organization_id}))`
      : ''
  }
  ${
    params.map_name
      ? `and planter.organization_id in ( SELECT entity_id from getEntityRelationshipChildren((select id from entity where map_name = '${params.map_name}')))`
      : ''
  }
  and estimated_geometric_location && (select geom from box)
  ORDER BY
    estimated_geometric_location <->
    ST_SetSRID(ST_MakePoint(${lng}, ${lat}),4326)
  LIMIT 1;
    `;
    }
    console.log('query:', sql);
    const result = await this.session.getDB().raw(sql);
    // {"st_asgeojson":"{\"type\":\"Point\",\"coordinates\":[39.1089215842116,-5.12839483715479]}"}
    return result.rows.length > 0
      ? JSON.parse(result.rows[0].st_asgeojson)
      : null;
  }
}
