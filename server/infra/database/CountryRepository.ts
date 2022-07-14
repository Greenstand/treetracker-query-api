import Country from 'interfaces/Country';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

type Filter = Partial<{ lat: number; lon: number }>;

export default class CountryRepository extends BaseRepository<Country> {
  constructor(session: Session) {
    super('region', session);
  }

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        id,
        name,
        St_asgeojson(centroid) as centroid
      `),
      )
      .table(this.tableName)
      .where('id', id)
      .first();
    if (!object) {
      throw new HttpError(404, `Can not found ${this.tableName} by id:${id}`);
    }
    return object;
  }

  async getByFilter(
    filter: Filter,
    // options?: { limit?: number | undefined } | undefined,
  ): Promise<Country[]> {
    const { lat, lon } = filter;
    const sql = `
        WITH country_id AS (
          select id from region_type where type = 'country'
          )
          SELECT
            id,
            name,
            St_asgeojson(centroid) as centroid
          FROM
            region
          WHERE
            ST_Contains(geom, ST_GeomFromText('POINT(${lon} ${lat})', 4326)) = true
            AND
            type_id in (select id from country_id);
    `;
    const object = await this.session.getDB().raw(sql);
    if (!object || object.rows.length <= 0) {
      throw new HttpError(
        404,
        `Can not found ${this.tableName} by lat:${lat} lon:${lon}`,
      );
    }
    return object.rows;
  }

  async getLeaderBoard(top = 10) {
    const sql = `
      select r.*, region.name, ST_AsGeoJSON(centroid) as centroid  from (
      select count(region.id) as planted, region.id
      from trees
      LEFT JOIN region
      on ST_WITHIN(trees.estimated_geometric_location, region.geom)
      left join region_type
      on region.type_id = region_type.id
      where
      region_type.type = 'country'
      group by region.id
      order by count(region.id) desc
      limit ${top}
      ) r left join region
      on r.id = region.id
      ;
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}
