import CountryRepository from "infra/database/CountryRepository";

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

//  function getById(countryRepository: CountryRepository): (id: number) => Promise<Country> {
//    return async function(id: number) {
//      const country = await countryRepository.getById(id);
//      return country;
//    };
//  }

function repositoryDelegate<Type>(Type, method): (r: any) => any {
  return function (repo: Type) {
    return async function (...args) {
      const result = await repo[method](...args);
      return result; 
    }
  }
}

// function repositoryDelegate(){
//   return function(countryRepository: CountryRepository){
//   }
// }

;

export default {
  getCountries,
  getById: repositoryDelegate(CountryRepository, "getById"),
  getByFilter: repositoryDelegate(CountryRepository, "getByFilter"),
}