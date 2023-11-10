import log from 'loglevel';
import FilterOptions from 'interfaces/FilterOptions';
import Species from 'interfaces/Species';
import SpeciesFilter from 'interfaces/SpeciesFilter';
import { delegateRepository } from '../infra/database/delegateRepository';
import SpeciesRepositoryV2 from '../infra/database/SpeciesRepositoryV2';

type Filter = Partial<{
  planter_id: number;
  wallet_id: string;
  grower_id: string;
}>;

function getByFilter(
  speciesRepository: SpeciesRepositoryV2,
): (filter: SpeciesFilter, options: FilterOptions) => Promise<SpeciesFilter[]> {
  return async function (filter: SpeciesFilter, options: FilterOptions) {
    const result = await speciesRepository.getByFilter(filter, options);
    return result;
  };
}

export default {
  getById: delegateRepository<SpeciesRepositoryV2, Species>('getById'),
  getByGrower: delegateRepository<SpeciesRepositoryV2, Species>('getByGrower'),
  getByFilter,
};
