import log from 'loglevel';
import Filter from 'interfaces/Filter';
import Planter from 'interfaces/Planter';
import { delegateRepository } from '../infra/database/delegateRepository';
import PlanterRepository from '../infra/database/PlanterRepository';

function getByFilter(
  planterRepository: PlanterRepository,
): (filter: Filter, options: any) => Promise<Planter[]> {
  return async function (filter: Filter, options: any) {
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
  getById: delegateRepository<PlanterRepository>('getById'),
  getByFilter,
  getPlanterLinks,
};
