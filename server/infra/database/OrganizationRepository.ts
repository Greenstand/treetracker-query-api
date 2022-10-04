import FilterOptions from 'interfaces/FilterOptions';
import Organization from 'interfaces/Organization';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import patch, { PATCH_TYPE } from './patch';
import Session from './Session';

export default class OrganizationRepository extends BaseRepository<Organization> {
  constructor(session: Session) {
    super('entity', session);
  }

  async getByPlanter(planter_id: number, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
      entity.*,
      l.*
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

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
          *
          from entity 
          left join webmap.organization_location l on l.id = entity.id
        `),
      )
      .where('entity.id', id)
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

  async getByMapName(mapName: string) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        entity.*,
        l.*
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
        l.*
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
