import CountryModel from './Country';

describe("/countries", () => {

  it("", async () => {
    const country1 = {
      name: "China",
    }
    const repo : any = {
      getByFilter: jest.fn(() => Promise.resolve([country1])),
    };
    const executeGetCountries = CountryModel.getCountries(repo);
    const result = await executeGetCountries({lat: 0, lon: 0});
    expect(result).toMatchObject([country1]);
  })

  it("getById", async () => {
    const country1 = {
      name: "China",
    }
    const repo : any = {
      getById: jest.fn(() => Promise.resolve(country1)),
    };
    // @ts-ignore
    const execute = CountryModel.getById(repo);
    const result = await execute(1);
    expect(result).toMatchObject(country1);
    expect(repo.getById).toBeCalledWith(1);
  })

})