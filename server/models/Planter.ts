import log from 'loglevel';
import FilterOptions from 'interfaces/FilterOptions';
import Planter from 'interfaces/Planter';
import { delegateRepository } from '../infra/database/delegateRepository';
import PlanterRepository from '../infra/database/PlanterRepository';

type Filter = Partial<{ organization_id: number }>;

function getByFilter(
  planterRepository: PlanterRepository,
): (filter: Filter, options: FilterOptions) => Promise<Planter[]> {
  return async function (filter: Filter, options: FilterOptions) {
    if (filter.organization_id) {
      log.warn('using org filter...');
      const trees = await planterRepository.getByOrganization(
        filter.organization_id,
        options,
      );
      return trees;
    }
    const trees = await planterRepository.getByFilter(filter, options);
    return trees;
  };
}

function countByFilter(
  planterRepository: PlanterRepository,
): (filter: Filter) => Promise<number> {
  return async function (filter: Filter) {
    if (filter.organization_id) {
      log.warn('using org filter...');
      const total = await planterRepository.countByOrganization(
        filter.organization_id,
      );
      return total;
    }
    const total = await planterRepository.countByFilter(filter);
    return total;
  };
}

function getByName(
  planterRepository: PlanterRepository,
): (keyword: string, options: FilterOptions) => Promise<Planter[]> {
  return async function (keyword: string, options: FilterOptions) {
    log.warn('using planter name filter...');
    const planters = await planterRepository.getByName(keyword, options);
    return planters;
  };
}

function countByName(
  planterRepository: PlanterRepository,
): (keyword: string) => Promise<number> {
  return async function (keyword: string) {
    const total = await planterRepository.countByName(keyword);
    return total;
  };
}

function getPlanterLinks(planter) {
  const links = {
    featured_trees: `/trees?planter_id=${planter.id}&limit=20&offset=0`,
    associated_organizations: `/organizations?planter_id=${planter.id}&limit=20&offset=0`,
    species: `/species?planter_id=${planter.id}&limit=20&offset=0`,
  };
  return links;
}

function getFeaturedPlanters(
  planterRepository: PlanterRepository,
): (options: FilterOptions) => Promise<Planter[]> {
  return async function (options: FilterOptions) {
    log.warn('using featured planters filter...');
    const planters = await planterRepository.getFeaturedPlanters(options);
    return planters;
  };
}

export default {
  getById: delegateRepository<PlanterRepository, Planter>('getById'),
  getByFilter,
  getByName,
  getPlanterLinks,
  getFeaturedPlanters,
  countByName,
  countByFilter
};
