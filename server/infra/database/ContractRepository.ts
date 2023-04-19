import Contract from 'interfaces/Contract';
import ContractFilter from 'interfaces/ContractFilter';
import FilterOptions from 'interfaces/FilterOptions';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class ContractRepository extends BaseRepository<Contract> {
  constructor(session: Session) {
    super('contract', session);
    this.tableName = 'contracts.contract';
  }

  filterWhereBuilder(object, builder) {
    const result = builder;
    const {
      whereNulls = [],
      whereNotNulls = [],
      whereIns = [],
      ...parameters
    } = object;

    if (parameters.tokenized === 'true') {
      whereNotNulls.push('wallet.token.id');
    } else if (parameters.tokenized === 'false') {
      whereNulls.push('wallet.token.id');
    }
    delete parameters.tokenized;

    // result.whereNot(`${this.tableName}.status`, 'deleted');

    whereNotNulls.forEach((whereNot) => {
      // to map table names to fields for query
      switch (true) {
        case whereNot === 'tag_id':
          result.whereNotNull('treetracker.capture_tag.tag_id');
          break;
        default:
          result.whereNotNull(whereNot);
      }

      // result.whereNotNull(whereNot);
    });

    whereNulls.forEach((whereNull) => {
      // to map table names to fields for query
      switch (true) {
        case whereNull === 'tag_id':
          result.whereNull('treetracker.capture_tag.tag_id');
          break;
        default:
          result.whereNull(whereNull);
      }
      // result.whereNull(whereNull);
    });

    whereIns.forEach((whereIn) => {
      result.whereIn(whereIn.field, whereIn.values);
    });

    const filterObject = { ...parameters };

    if (filterObject.startDate) {
      result.where(
        `${this.tableName}.captured_at`,
        '>=',
        filterObject.startDate,
      );
      delete filterObject.startDate;
    }
    if (filterObject.endDate) {
      result.where(`${this.tableName}.captured_at`, '<=', filterObject.endDate);
      delete filterObject.endDate;
    }

    // if (filterObject.tag_id) {
    //   filterObject[`treetracker.capture_tag.tag_id`] = filterObject.tag_id;
    //   delete filterObject.tag_id;
    // }

    if (filterObject.id) {
      result.where(`${this.tableName}.id`, '=', filterObject.id);
      delete filterObject.id;
    }

    // if (filterObject.reference_id) {
    //   result.where(
    //     `${this.tableName}.reference_id`,
    //     '=',
    //     filterObject.reference_id,
    //   );
    //   delete filterObject.reference_id;
    // }

    if (filterObject.organization_id) {
      result.where(`${this.tableName}.growing_organization_id`, 'in', [
        ...filterObject.organization_id,
      ]);
      delete filterObject.organization_id;
    }

    result.where(filterObject);
  }

  async getByFilter(filterCriteria: ContractFilter, options: FilterOptions) {
    const knex = this.session.getDB();
    const { sort, ...filter } = filterCriteria;

    // there are two joins to connect the capture to the token and to the wallet right now so that we can double check our data entries
    // the current data entered in the tables doesn't match up so there are some mismatches
    let promise = knex
      .select(
        knex.raw(
          `
            row_to_json(contract.*) AS contract,
            row_to_json(agreement.*) AS agreement,
            row_to_json(grower_account.*) AS worker,
            row_to_json(stakeholder.*) AS stakeholder
          FROM contracts.contract AS contract
          LEFT JOIN contracts.agreement AS agreement
              ON agreement.id = contract.agreement_id
          LEFT JOIN stakeholder.stakeholder AS stakeholder
              ON stakeholder.id = agreement.growing_organization_id
          LEFT JOIN treetracker.grower_account AS grower_account
              ON grower_account.id = contract.worker_id
        `,
        ),
      )
      .where((builder) => this.filterWhereBuilder(filter, builder));

    promise = promise.orderBy(
      sort?.order_by || `${this.tableName}.id`,
      sort?.order || 'desc',
    );

    const { limit, offset } = options;
    if (limit) {
      promise = promise.limit(limit);
    }
    if (offset) {
      promise = promise.offset(offset);
    }

    const captures = await promise;

    return captures;
  }

  async getCount(filterCriteria: ContractFilter) {
    const knex = this.session.getDB();
    const { ...filter } = filterCriteria;

    const result = await knex
      .select(
        knex.raw(
          `COUNT(*) AS count
          FROM contracts.contract AS contract
          LEFT JOIN contracts.agreement AS agreement
              ON agreement.id = contract.agreement_id
          LEFT JOIN stakeholder.stakeholder AS stakeholder
              ON stakeholder.id = agreement.growing_organization_id
          LEFT JOIN treetracker.grower_account AS grower_account
              ON grower_account.id = contract.worker_id
        `,
        ),
      )
      .where((builder) => this.filterWhereBuilder(filter, builder));

    return result[0].count;
  }

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
            contract.*,
            agreement.*,
            grower_account.*,
            stakeholder.*
          FROM contracts.contract AS contract
          LEFT JOIN contracts.agreement AS agreement
              ON agreement.id = contract.agreement_id
          LEFT JOIN stakeholder.stakeholder AS stakeholder
              ON stakeholder.id = agreement.growing_organization_id
          LEFT JOIN treetracker.grower_account AS grower_account
              ON grower_account.id = contract.worker_id
      `),
      )
      .where(`${this.tableName}.id`, id)
      .first();

    if (!object) {
      throw new HttpError(404, `Can not find ${this.tableName} by id:${id}`);
    }
    return object;
  }
}
