import CountryRepository from "infra/database/CountryRepository";
import { delegateRepository } from "../infra/database/delegateRepository";

export type Country = {
  name: string,
  code: string,
  lat: number,
  lon: number,
}

function getCountries(countryRepository: CountryRepository): (filter: any) => Promise<Country[]> {
  return async function(filter: any) {
    const countries = await countryRepository.getByFilter(filter);
    return countries;
  };
}

export default {
  getCountries,
  getById: delegateRepository(CountryRepository, "getById"),
  getByFilter: delegateRepository(CountryRepository, "getByFilter"),
  getLeaderBoard: delegateRepository(CountryRepository, "getLeaderBoard"),
}