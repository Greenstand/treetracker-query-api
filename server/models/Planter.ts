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

function getPlanterLinks(planter) {
  const links = {
    featured_trees: `/trees?planter_id=${planter.id}&limit=20&offset=0`,
    associated_organizations: `/organizations?planter_id=${planter.id}&limit=20&offset=0`,
    species: `/species?planter_id=${planter.id}&limit=20&offset=0`,
  };
  return links;
}

export default {
  getById: delegateRepository<PlanterRepository, Planter>('getById'),
  getByFilter,
  getPlanterLinks,
};
