import FilterOptions from 'interfaces/FilterOptions';
import Planter from 'interfaces/Planter';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

enum RegionTypes {
  country = 6,
  continent = 5,
}
export default class PlanterRepository extends BaseRepository<Planter> {
  constructor(session: Session) {
    super('planter', session);
  }

  async getById(id: string | number) {
    let sql = `
      select * 
        from planter
        where id = ${id}
    `;
    const planterObject = await this.session.getDB().raw(sql);

    if (!planterObject.rows[0]) {
      throw new HttpError(404, `Can not found ${this.tableName} by id:${id}`);
    }

    // Because currently,
    // we don't have crossing countries planter,
    // so it should be fine this way.
    sql = `
            select
            distinct
            min(region.name) as country_name,
            region.type_id
            from trees
              LEFT JOIN region
                on ST_WITHIN(trees.estimated_geometric_location, region.geom)
                and region.type_id in
                (select id from region_type where type = 'continents' or type = 'country')
            where trees.planter_id = ${id}
            group by region.type_id
      `;
    const object = await this.session.getDB().raw(sql);

    const regionNames = {
      continent: null,
      country: null,
    };

    for (let i = 0; i < object.rows.length; i++) {
      if (object.rows[i].type_id === RegionTypes.continent) {
        regionNames.continent = object.rows[i].country_name;
      }

      if (object.rows[i].type_id === RegionTypes.country) {
        regionNames.country = object.rows[i].country_name;
      }
    }

    return {
      ...planterObject.rows[0],
      ...regionNames,
    };
  }

  async getByOrganization(organization_id: number, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        *
      FROM planter
      WHERE planter.organization_id = ${organization_id}
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getByName(keyword: string, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        *
      FROM planter
      WHERE first_name LIKE '${keyword}%' OR last_name LIKE '${keyword}%'
      ORDER BY first_name, last_name
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getFeaturedPlanters(options: FilterOptions) {
    const { limit } = options;
    const sql = `
      SELECT
      *
      FROM planter
      ORDER BY id DESC
      LIMIT ${limit}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}
