import { Country } from "../../models/Country";
import HttpError from "../../utils/HttpError";
import BaseRepository from "./BaseRepository";
import Session from "./Session";

export default class CountryRepository extends BaseRepository<Country> {
  constructor(session: Session) {
    super("region", session);
  }

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        id,
        name,
        St_asgeojson(centroid) as centroid
      `))
      .table(this.tableName)
      .where('id', id)
      .first()
    if (!object) {
      throw new HttpError(404, `Can not found ${this.tableName} by id:${id}`)
    }
    return object;
  }

  async getByFilter(filter: any, options?: { limit?: number | undefined; } | undefined): Promise<any[]> {
    const {lat, lon} = filter;
    const sql = `
      SELECT
        id,
        name,
        St_asgeojson(centroid) as centroid
      FROM
        region
      WHERE 
        ST_Contains(geom, ST_GeomFromText('POINT(${lon} ${lat})', 4326)) = true
        AND 
        type_id = 6
    `;
    const object = await this.session
      .getDB()
      .raw(sql);
    if (!object && object.rows.length !== 1) {
      throw new HttpError(404, `Can not found ${this.tableName} by lat:${lat} lon:${lon}`);
    }
    return object.rows[0];
  }

  async getLeaderBoard(top : number = 10){
    const sql = `
      select r.*, region.name, centroid  from (
      select count(region.id) as total, region.id
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
    const object = await this.session
      .getDB()
      .raw(sql);
    return object.rows;
  }
}




