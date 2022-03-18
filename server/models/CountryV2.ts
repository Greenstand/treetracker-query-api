import CountryRepositoryV2 from 'infra/database/CountryRepositoryV2';
import Country from 'interfaces/Country';
import { delegateRepository } from '../infra/database/delegateRepository';

type Filter = Partial<{ lat: number; lon: number }>;

function getCountries(
  countryRepository: CountryRepositoryV2,
): (filter: Filter) => Promise<Country[]> {
  return async function (filter: Filter) {
    const countries = await countryRepository.getByFilter(filter);
    return countries;
  };
}

export default {
  getCountries,
  getById: delegateRepository<CountryRepositoryV2, Country>('getById'),
  getByFilter: delegateRepository<CountryRepositoryV2, Country>('getByFilter'),
};
