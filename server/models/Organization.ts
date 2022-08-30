import log from 'loglevel';
import FilterOptions from 'interfaces/FilterOptions';
import Organization from 'interfaces/Organization';
import { delegateRepository } from '../infra/database/delegateRepository';
import OrganizationRepository from '../infra/database/OrganizationRepository';

type Filter = Partial<{ planter_id: number; organization_id: number }>;

function getByFilter(
  organizationRepository: OrganizationRepository,
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
  getById: delegateRepository<OrganizationRepository, Organization>('getById'),
  getByMapName: delegateRepository<OrganizationRepository, Organization>(
    'getByMapName',
  ),
  getByFilter,
  getOrganizationLinks,
  getFeaturedOrganizations: delegateRepository<
    OrganizationRepository,
    Organization
  >('getFeaturedOrganizations'),
};
