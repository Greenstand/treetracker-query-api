import FilterOptions from 'interfaces/FilterOptions';
import Planter from 'interfaces/Planter';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

type Filter = Partial<{ organization_id: number }>;

export default class PlanterRepository extends BaseRepository<Planter> {
  constructor(session: Session) {
    super('planter', session);
  }

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        planter.*,
        country.name as country_name,
        continent.name as continent_name,
        planter_registrations.created_at as created_at
        from planter
        left join trees on planter.id = trees.planter_id
        left join region as country on ST_WITHIN(trees.estimated_geometric_location, country.geom)
          and country.type_id in
            (select id from region_type where type = 'country')
        left join region as continent on ST_WITHIN(trees.estimated_geometric_location, continent.geom)
          and continent.type_id in
            (select id from region_type where type = 'continents' )
        left join planter_registrations on planter.id = planter_registrations.planter_id
      `),
      )
      .where('planter.id', id)
      .first();

    if (!object) {
      throw new HttpError(404, `Can not find ${this.tableName} by id:${id}`);
    }
    return object;
  }

  async getByOrganization(organization_id: number, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        planter.*,
        planter_registrations.created_at
      FROM planter
      LEFT JOIN planter_registrations
           ON planter.id = planter_registrations.planter_id
      WHERE planter.organization_id = ${organization_id}
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);

    if (!object) {
      throw new HttpError(
        404,
        `Can not find ${this.tableName} by organization_id: ${organization_id}`,
      );
    }
    return object.rows;
  }

  async getByFilter(filter: Filter, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        planter.*,
        planter_registrations.created_at
      FROM planter
      LEFT JOIN planter_registrations
           ON planter.id = planter_registrations.planter_id
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
        planter.*,
        planter_registrations.created_at
      FROM planter
      LEFT JOIN planter_registrations
           ON planter.id = planter_registrations.planter_id
      WHERE planter.first_name LIKE '${keyword}%' OR planter.last_name LIKE '${keyword}%'
      ORDER BY planter.first_name, planter.last_name
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);

    if (!object) {
      throw new HttpError(
        404,
        `Can not find ${this.tableName} by name: ${keyword}`,
      );
    }
    return object.rows;
  }

  async getFeaturedPlanters(options: FilterOptions) {
    const { limit } = options;
    const sql = `
      select planter.* from planter 
      join (
      SELECT json_array_elements(data -> 'planters') AS planter_id FROM webmap.config WHERE name = 'featured-planter'
      ) AS t ON 
      t.planter_id::text::integer = planter.id;
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}
