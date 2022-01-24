import Country from 'interfaces/Country';
import Filter from 'interfaces/Filter';
import CountryRepository from '../infra/database/CountryRepository';
import { delegateRepository } from '../infra/database/delegateRepository';

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
  getById: delegateRepository<CountryRepository>('getById'),
  getByFilter: delegateRepository<CountryRepository>('getByFilter'),
  getLeaderBoard: delegateRepository<CountryRepository>('getLeaderBoard'),
};
