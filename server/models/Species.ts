import log from 'loglevel';
import FilterOptions from 'interfaces/FilterOptions';
import Species from 'interfaces/Species';
import SpeciesRepository from 'repositories/SpeciesRepository';
import Session from 'infra/database/Session';

export type SpeciesFilter = Partial<{
  planter_id: number;
  organization_id: number;
  wallet_id: string;
}>;

class SpeciesModel {
  private speciesRepository: SpeciesRepository;
  constructor(session: Session) {
    this.speciesRepository = new SpeciesRepository(session);
  }

  async getSpecies(
    filter: SpeciesFilter,
    options: FilterOptions,
  ): Promise<{ species: Species[]; count: number }> {
    console.log(filter);
    if (filter.organization_id) {
      log.warn('using org filter...');
      return this.speciesRepository.getByOrganization(
        filter.organization_id,
        options,
      );
    } else {
      delete filter.organization_id;
    }

    if (filter.planter_id) {
      log.warn('using planter filter...');
      return this.speciesRepository.getByPlanter(filter.planter_id, options);
    } else {
      delete filter.planter_id;
    }

    if (filter.wallet_id) {
      log.warn('using wallet filter...');
      return this.speciesRepository.getByWallet(filter.wallet_id, options);
    } else {
      delete filter.wallet_id;
    }

    const species = await this.speciesRepository.getByFilter(filter, options);
    const count = await this.speciesRepository.countByFilter(filter);
    return { species, count };
  }

  async getSpeciesById(species_id: number): Promise<Species> {
    return this.speciesRepository.getById(species_id);
  }
}

export default SpeciesModel;
