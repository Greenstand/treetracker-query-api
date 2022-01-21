import log from 'loglevel';
import { delegateRepository } from '../infra/database/delegateRepository';
import OrganizationRepository from '../infra/database/OrganizationRepository';

export type Organization = {
  id: number;
  first_name: string;
  last_name: string;
};

function getByFilter(
  organizationRepository: OrganizationRepository,
): (filter: any, options: any) => Promise<Organization[]> {
  return async function (filter: any, options: any) {
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
  getById: delegateRepository<OrganizationRepository>('getById'),
  getByFilter,
  getOrganizationLinks,
};
