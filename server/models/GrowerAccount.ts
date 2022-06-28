import log from 'loglevel';
import FilterOptions from 'interfaces/FilterOptions';
import GrowerAccount from 'interfaces/GrowerAccount';
import { delegateRepository } from '../infra/database/delegateRepository';
import GrowerAccountRepository from '../infra/database/GrowerAccountRepository';

type Filter = Partial<{ organization_id: number }>;

function getByFilter(
  growerAccountRepository: GrowerAccountRepository,
): (filter: Filter, options: FilterOptions) => Promise<GrowerAccount[]> {
  return async function (filter: Filter, options: FilterOptions) {
    if (filter.organization_id) {
      log.warn('using org filter...');
      const trees = await growerAccountRepository.getByOrganization(
        filter.organization_id,
        options,
      );
      return trees;
    }
    const trees = await growerAccountRepository.getByFilter(filter, options);
    return trees;
  };
}

function getByName(
  growerAccountRepository: GrowerAccountRepository,
): (keyword: string, options: FilterOptions) => Promise<GrowerAccount[]> {
  return async function (keyword: string, options: FilterOptions) {
    log.warn('using planter name filter...');
    const planters = await growerAccountRepository.getByName(keyword, options);
    return planters;
  };
}

function getGrowerAccountLinks(planter) {
  const links = {
    featured_trees: `/trees?planter_id=${planter.id}&limit=20&offset=0`,
    associated_organizations: `/organizations?planter_id=${planter.id}&limit=20&offset=0`,
    species: `/species?planter_id=${planter.id}&limit=20&offset=0`,
  };
  return links;
}

function getFeaturedPlanters(
  growerAccountRepository: GrowerAccountRepository,
): (options: FilterOptions) => Promise<GrowerAccount[]> {
  return async function (options: FilterOptions) {
    log.warn('using featured planters filter...');
    const planters = await growerAccountRepository.getFeaturedGrowerAccounts(
      options,
    );
    return planters;
  };
}

export default {
  getById: delegateRepository<GrowerAccountRepository, GrowerAccount>(
    'getById',
  ),
  getByFilter,
  getByName,
  getGrowerAccountLinks,
  getFeaturedPlanters,
};
