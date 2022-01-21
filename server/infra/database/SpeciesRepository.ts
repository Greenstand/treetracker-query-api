import { Species } from 'models/Species';
import BaseRepository from './BaseRepository';
import Session from './Session';
import HttpError from '../../utils/HttpError';

export default class SpeciesRepository extends BaseRepository<Species> {
  constructor(session: Session) {
    super('tree_species', session);
  }

  async getByOrganization(organization_id: number, options: any) {
    const { limit, offset } = options;
    const sql = `
      select species_id as id, count(species_id) as total, tree_species.name
      from trees
      LEFT JOIN tree_species 
      on trees.species_id = tree_species.id
      JOIN planter
      ON planter.id = trees.planter_id
      where 
      trees.active = true
      AND tree_species.name is not null
      AND trees.species_id is not null
      AND planter.organization_id IN (SELECT entity_id from getEntityRelationshipChildren(${organization_id}))
      group by species_id, tree_species.name
      order by total desc
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getByPlanter(planter_id: number, options: any) {
    const { limit, offset } = options;
    const sql = `
      select species_id as id, count(species_id) as total, tree_species.name
      from trees
      LEFT JOIN tree_species 
      on trees.species_id = tree_species.id
      where 
      trees.active = true
      AND trees.planter_id = ${planter_id}
      AND tree_species.name is not null
      AND trees.species_id is not null
      group by species_id, tree_species.name
      order by total desc
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}
