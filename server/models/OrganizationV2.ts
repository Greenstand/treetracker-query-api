import log from 'loglevel';
import OrganizationRepositoryV2 from 'infra/database/OrganizationRepositoryV2';
import FilterOptions from 'interfaces/FilterOptions';
import Organization from 'interfaces/Organization';
import { delegateRepository } from '../infra/database/delegateRepository';

type Filter = Partial<{
  planter_id: number;
  organization_id: number;
  grower_id: string;
  ids: Array<string>;
}>;

function getByFilter(
  organizationRepository: OrganizationRepositoryV2,
): (filter: Filter, options: FilterOptions) => Promise<Organization[]> {
  return async function (filter: Filter, options: FilterOptions) {
    if (filter.planter_id) {
      log.warn('using planter filter...');
      const trees = await organizationRepository.getByPlanter(
        filter.planter_id,
        options,
      );
      return trees;
    }
    if (filter.grower_id) {
      log.warn('using grower filter...');
      const trees = await organizationRepository.getByGrower(
        filter.grower_id,
        options,
      );
      return trees;
    }
    if (filter?.ids?.length) {
      log.warn('using ids filter...');
      const trees = await organizationRepository.getByIds(filter.ids, options);
      return trees;
    }
    const trees = await organizationRepository.getByFilter(filter, options);
    return trees;
  };
}

function getOrganizationLinks(organization) {
  const links = {
    featured_trees: `/trees?organization_id=${organization.id}&limit=20&offset=0`,
    associated_planters: `/planters?organization_id=${organization.id}&limit=20&offset=0`,
    species: `/species?organization_id=${organization.id}&limit=20&offset=0`,
  };
  return links;
}

export default {
  getById: delegateRepository<OrganizationRepositoryV2, Organization>(
    'getById',
  ),
  getByMapName: delegateRepository<OrganizationRepositoryV2, Organization>(
    'getByMapName',
  ),
  getByFilter,
  getOrganizationLinks,
  getFeaturedOrganizations: delegateRepository<
    OrganizationRepositoryV2,
    Organization
  >('getFeaturedOrganizations'),
};
