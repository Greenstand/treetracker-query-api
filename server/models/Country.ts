import Country from 'interfaces/Country';
import CountryRepository from '../infra/database/CountryRepository';
import { delegateRepository } from '../infra/database/delegateRepository';

type Filter = Partial<{ lat: number; lon: number }>;

function getCountries(
  countryRepository: CountryRepository,
): (filter: Filter) => Promise<Country[]> {
  return async function (filter: Filter) {
    const countries = await countryRepository.getByFilter(filter);
    return countries;
  };
}

export default {
  getCountries,
  getById: delegateRepository<CountryRepository, Country>('getById'),
  getByFilter: delegateRepository<CountryRepository, Country>('getByFilter'),
  getLeaderBoard: delegateRepository<CountryRepository, Country>(
    'getLeaderBoard',
  ),
};
