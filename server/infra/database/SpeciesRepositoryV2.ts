import FilterOptions from 'interfaces/FilterOptions';
import Species from 'interfaces/Species';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class SpeciesRepositoryV2 extends BaseRepository<Species> {
  constructor(session: Session) {
    super('tree_species', session);
    this.tableName = 'herbarium.species';
  }

  filterWhereBuilder(object, builder) {
    const result = builder;
    const {
      whereNulls = [],
      whereNotNulls = [],
      whereIns = [],
      ...parameters
    } = object;

    result.whereNot(`${this.tableName}.status`, 'deleted');
    whereNotNulls.forEach((whereNot) => {
      result.whereNotNull(whereNot);
    });

    whereNulls.forEach((whereNull) => {
      result.whereNull(whereNull);
    });

    whereIns.forEach((whereIn) => {
      result.whereIn(whereIn.field, whereIn.values);
    });

    const filterObject = { ...parameters };

    if (filterObject.id) {
      result.where(`${this.tableName}.id`, '=', filterObject.id);
      delete filterObject.id;
    }

    if (filterObject.scientific_name) {
      result.where(
        `${this.tableName}.scientific_name`,
        'ilike',
        `%${filterObject.scientific_name}%`,
      );
      delete filterObject.scientific_name;
    }

    if (filterObject.organization_id) {
      result.where(
        `${this.tableName}.organization_id`,
        '=',
        `${filterObject.organization_id}`,
      );
      delete filterObject.organization_id;
    }

    // if 'captures_amount_max' === 0, 'captures_amount_min' can be only 0.
    if (filterObject.captures_amount_max === 0) {
      result.whereNull('c.captures_count');
      delete filterObject.captures_amount_min;
      delete filterObject.captures_amount_max;
    }

    // if 'captures_amount_max' === 0 and 'captures_amount_max' is not defined, all results should be returned.
    if (
      filterObject.captures_amount_min === 0 &&
      !filterObject.captures_amount_max
    ) {
      delete filterObject.captures_amount_min;
      delete filterObject.captures_amount_max;
    }

    if (filterObject.captures_amount_min) {
      result.where(
        `c.captures_count`,
        '>=',
        `${filterObject.captures_amount_min}`,
      );
      delete filterObject.captures_amount_min;
    }

    if (filterObject.captures_amount_max) {
      result.where(
        `c.captures_count`,
        '<=',
        `${filterObject.captures_amount_max}`,
      );
      delete filterObject.captures_amount_max;
    }

    if (filterObject.wallet) {
      result.where(
        `${this.tableName}.wallet`,
        'ilike',
        `%${filterObject.wallet}%`,
      );
      delete filterObject.wallet;
    }

    result.where(filterObject);
  }
}
