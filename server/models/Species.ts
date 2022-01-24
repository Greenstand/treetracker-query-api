import log from 'loglevel';
import Filter from 'interfaces/Filter';
import Species from 'interfaces/Species';
import { delegateRepository } from '../infra/database/delegateRepository';
import SpeciesRepository from '../infra/database/SpeciesRepository';

function getByFilter(
  speciesRepository: SpeciesRepository,
): (filter: Filter, options: any) => Promise<Species[]> {
  return async function (filter: Filter, options: any) {
    if (filter.organization_id) {
      log.warn('using org filter...');
      const trees = await speciesRepository.getByOrganization(
        filter.organization_id,
        options,
      );
      return trees;
    }
    if (filter.planter_id) {
      log.warn('using planter filter...');
      const trees = await speciesRepository.getByPlanter(
        filter.planter_id,
        options,
      );
      return trees;
    }
    const trees = await speciesRepository.getByFilter(filter, options);
    return trees;
  };
}

export default {
  getById: delegateRepository<SpeciesRepository>('getById'),
  getByFilter,
};
