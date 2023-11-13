import FilterOptions from 'interfaces/FilterOptions';
import Organization from 'interfaces/Organization';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import patch, { PATCH_TYPE } from './patch';
import Session from './Session';

export default class OrganizationRepositoryV2 extends BaseRepository<Organization> {
  constructor(session: Session) {
    super('stakeholder.stakeholder', session);
  }

  async getByPlanter(planter_id: number, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
      entity.*,
      l.country_id, l.country_name, l.continent_id, l.continent_name
      FROM entity
      LEFT JOIN webmap.organization_location l ON l.id = entity.id
      LEFT JOIN planter ON planter.organization_id = entity.id
      WHERE planter.id = ${planter_id}
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    const objectPatched = await patch(
      object.rows,
      PATCH_TYPE.EXTRA_ORG,
      this.session,
    );
    return objectPatched;
  }

  async getByGrower(grower_id: string, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
      entity.*,
      l.country_id, l.country_name, l.continent_id, l.continent_name
      FROM entity
      LEFT JOIN webmap.organization_location l ON l.id = entity.id
      LEFT JOIN planter ON planter.organization_id = entity.id
      WHERE planter.grower_account_uuid = '${grower_id}'
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    const objectPatched = await patch(
      object.rows,
      PATCH_TYPE.EXTRA_ORG,
      this.session,
    );
    return objectPatched;
  }

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select()
      .from(this.tableName)
      .where('id', id)
      .first();

    if (!object) {
      throw new HttpError(404, `Can not find ${this.tableName} by id:${id}`);
    }
    const objectPatched = await patch(
      object,
      PATCH_TYPE.EXTRA_ORG,
      this.session,
    );
    return objectPatched;
  }

  async getByIds(ids: Array<string>, options: FilterOptions) {
    const { limit = 20, offset = 0 } = options;

    const result = await this.session
      .getDB()
      .select('*')
      .from(this.tableName)
      .whereIn('id', ids)
      .offset(offset)
      .limit(limit);

    return result;
  }

  // async getByGrowerId(id: string | number) {
  //   const object = await this.session
  //     .getDB()
  //     .select()
  //     .from(this.tableName)
  //     .where('grower_account_', id)
  //     .first();

  //   if (!object) {
  //     throw new HttpError(404, `Can not find ${this.tableName} by id:${id}`);
  //   }
  //   const objectPatched = await patch(
  //     object,
  //     PATCH_TYPE.EXTRA_ORG,
  //     this.session,
  //   );
  //   return objectPatched;
  // }

  async getByMapName(mapName: string) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        entity.*,
        l.country_id, l.country_name, l.continent_id, l.continent_name
        from entity 
        LEFT JOIN webmap.organization_location l ON l.id = entity.id
        `),
      )
      .where('entity.map_name', mapName)
      .first();

    if (!object) {
      throw new HttpError(
        404,
        `Can not find ${this.tableName} by map name:${mapName}`,
      );
    }
    const objectPatched = await patch(
      object,
      PATCH_TYPE.EXTRA_ORG,
      this.session,
    );
    return objectPatched;
  }

  async getFeaturedOrganizations() {
    const sql = `
      select 
        entity.*,
      l.country_id, l.country_name, l.continent_id, l.continent_name
      from entity 
      LEFT JOIN webmap.organization_location l ON l.id = entity.id
      join (
      --- convert json array to row
      SELECT json_array_elements(data -> 'organizations') AS organization_id FROM webmap.config WHERE name = 'featured-organization'
      ) AS t ON 
      t.organization_id::text::integer = entity.id;
    `;
    const object = await this.session.getDB().raw(sql);

    const objectPatched = await patch(
      object.rows,
      PATCH_TYPE.EXTRA_ORG,
      this.session,
    );
    return objectPatched;
  }
}
