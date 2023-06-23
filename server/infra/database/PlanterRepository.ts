import log from 'loglevel';
import FilterOptions from 'interfaces/FilterOptions';
import Planter from 'interfaces/Planter';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import patch, { PATCH_TYPE } from './patch';
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
      l.country_id, l.country_name, l.continent_id, l.continent_name,
        planter_registrations.created_at as created_at
        from planter
        left join planter_registrations on planter.id = planter_registrations.planter_id
        AND planter_registrations.created_at = (Select Min(created_at) from planter_registrations as planter_reg where planter_reg.planter_id=planter.id)
        LEFT JOIN webmap.planter_location l ON l.id = planter.id
      `),
      )
      .where('planter.id', id)
      .first();

    if (!object) {
      throw new HttpError(404, `Can not find ${this.tableName} by id:${id}`);
    }

    const objectPatched = await patch(
      object,
      PATCH_TYPE.EXTRA_PLANTER,
      this.session,
    );

    return objectPatched;
  }

  async getByOrganization(organization_id: number, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        planter.*,
        planter_registrations.created_at,
      l.country_id, l.country_name, l.continent_id, l.continent_name
      FROM planter
      LEFT JOIN planter_registrations
           ON planter.id = planter_registrations.planter_id
           AND planter_registrations.created_at = (Select Min(created_at) from planter_registrations as planter_reg where planter_reg.planter_id=planter.id)
      LEFT JOIN webmap.planter_location l ON l.id = planter.id
      WHERE planter.organization_id in (select entity_id from getEntityRelationshipChildren(${organization_id}))
      ${
        options.orderBy
          ? `order by ${options.orderBy.column} ${options.orderBy.direction}`
          : ''
      }
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

    const objectPatched = await patch(
      object.rows,
      PATCH_TYPE.EXTRA_PLANTER,
      this.session,
    );

    return objectPatched;
  }

  async countByOrganization(organization_id: number) {
    const totalSql = `
      SELECT
        COUNT(*)
      FROM planter
      WHERE planter.organization_id in (select entity_id from getEntityRelationshipChildren(${organization_id}))
    `;
    const total = await this.session.getDB().raw(totalSql);
    return parseInt(total.rows[0].count.toString());
  }

  async getByFilter(filter: Filter, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        planter.*,
        planter_registrations.created_at,
      l.country_id, l.country_name, l.continent_id, l.continent_name
      FROM planter
      LEFT JOIN planter_registrations
           ON planter.id = planter_registrations.planter_id
           AND planter_registrations.created_at = (Select Min(created_at) from planter_registrations as planter_reg where planter_reg.planter_id=planter.id)
      LEFT JOIN webmap.planter_location l ON l.id = planter.id
      ${
        options.orderBy
          ? `order by ${options.orderBy.column} ${options.orderBy.direction}`
          : ''
      }
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
        planter_registrations.created_at,
      l.country_id, l.country_name, l.continent_id, l.continent_name
      FROM planter
      LEFT JOIN planter_registrations
           ON planter.id = planter_registrations.planter_id
           AND planter_registrations.created_at = (Select Min(created_at) from planter_registrations as planter_reg where planter_reg.planter_id=planter.id)      LEFT JOIN webmap.planter_location l ON l.id = planter.id
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

    const objectPatched = await patch(
      object.rows,
      PATCH_TYPE.EXTRA_PLANTER,
      this.session,
    );
    return objectPatched;
  }

  async countByName(keyword: string) {
    const totalSql = `
      SELECT
      COUNT(*)
      FROM planter
      WHERE planter.first_name LIKE '${keyword}%' OR planter.last_name LIKE '${keyword}%'
    `;
    const total = await this.session.getDB().raw(totalSql);
    return parseInt(total.rows[0].count.toString());
  }

  async getFeaturedPlanters(options: FilterOptions) {
    const { limit } = options;
    const sql = `
      select 
        planter.*,
      l.country_id, l.country_name, l.continent_id, l.continent_name
      from planter 
      LEFT JOIN webmap.planter_location l ON l.id = planter.id
      join (
      SELECT json_array_elements(data -> 'planters') AS planter_id FROM webmap.config WHERE name = 'featured-planter'
      ) AS t ON 
      t.planter_id::text::integer = planter.id;
    `;
    const object = await this.session.getDB().raw(sql);

    const objectPatched = await patch(
      object.rows,
      PATCH_TYPE.EXTRA_PLANTER,
      this.session,
    );
    return objectPatched;
  }
}
