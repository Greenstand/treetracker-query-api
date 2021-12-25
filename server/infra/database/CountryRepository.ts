import { Country } from "models/Country";
import HttpError from "utils/HttpError";
import BaseRepository from "./BaseRepository";
import Session from "./session";

export default class CountryRepository extends BaseRepository<Country> {
  constructor(session?: Session) {
    const sessionInstance = session || new Session();
    super("region", sessionInstance);
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
    // // SQL to get countries in 'region' table that are within a radius of 10km of the given lat/lon
    // const sql = `
    //   SELECT
    //     id,
    //     name,
    //     St_asgeojson(centroid) as centroid
    //   FROM
    //     region
    //   WHERE
    //     ST_DWithin(centroid, ST_GeomFromText('POINT(${lon} ${lat})', 4326), 10) = true    
    // `;
    // SQL to get countries in 'region' table
    // that the given lat/lon is within MultiPolygon column 'geom'
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
}



