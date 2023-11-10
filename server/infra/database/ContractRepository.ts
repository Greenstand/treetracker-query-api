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

    result.whereNot(`${this.tableName}.status`, 'deleted');

    whereNotNulls.forEach((whereNot) => {
      // to map table names to fields for query
      switch (true) {
        case whereNot === 'tag_id':
          result.whereNotNull('treetracker.capture_tag.tag_id');
          break;
        default:
          result.whereNotNull(whereNot);
      }
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

    if (filterObject.id) {
      result.where(`${this.tableName}.id`, '=', filterObject.id);
      delete filterObject.id;
    }

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

    let promise = knex
      .select(
        knex.raw(
          `
            ${this.tableName}.id,
            ${this.tableName}.status,
            ${this.tableName}.notes,
            ${this.tableName}.created_at,
            ${this.tableName}.updated_at,
            ${this.tableName}.signed_at,
            ${this.tableName}.closed_at,
            ${this.tableName}.listed,
            row_to_json(agreement.*) AS agreement,
            row_to_json(grower_account.*) AS worker,
            row_to_json(stakeholder.*) AS stakeholder
          FROM ${this.tableName}
          LEFT JOIN contracts.agreement AS agreement
              ON agreement.id = ${this.tableName}.agreement_id
          LEFT JOIN stakeholder.stakeholder AS stakeholder
              ON stakeholder.id = agreement.growing_organization_id
          LEFT JOIN treetracker.grower_account AS grower_account
              ON grower_account.id = ${this.tableName}.worker_id
        `,
        ),
      )
      .where((builder) => this.filterWhereBuilder(filter, builder));

    promise = promise.orderBy(
      `${this.tableName}.${sort?.order_by}` || `${this.tableName}.id`,
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
          FROM ${this.tableName}
          LEFT JOIN contracts.agreement AS agreement
              ON agreement.id = ${this.tableName}.agreement_id
          LEFT JOIN stakeholder.stakeholder AS stakeholder
              ON stakeholder.id = agreement.growing_organization_id
          LEFT JOIN treetracker.grower_account AS grower_account
              ON grower_account.id = ${this.tableName}.worker_id
        `,
        ),
      )
      .where((builder) => this.filterWhereBuilder(filter, builder));

    return result[0].count;
  }

  async getById(id: string) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
            ${this.tableName}.id,
            ${this.tableName}.status,
            ${this.tableName}.notes,
            ${this.tableName}.created_at,
            ${this.tableName}.updated_at,
            ${this.tableName}.signed_at,
            ${this.tableName}.closed_at,
            ${this.tableName}.listed,
            row_to_json(agreement.*) AS agreement,
            row_to_json(grower_account.*) AS worker,
            row_to_json(stakeholder.*) AS stakeholder
          FROM ${this.tableName}
          LEFT JOIN contracts.agreement AS agreement
              ON agreement.id = ${this.tableName}.agreement_id
          LEFT JOIN stakeholder.stakeholder AS stakeholder
              ON stakeholder.id = agreement.growing_organization_id
          LEFT JOIN treetracker.grower_account AS grower_account
              ON grower_account.id = ${this.tableName}.worker_id
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
