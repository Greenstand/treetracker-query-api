import { Country } from "models/Country";
import BaseRepository from "./BaseRepository";
import Session from "./session";

export default class CountryRepository extends BaseRepository<Country> {
  constructor(session?: Session) {
    const sessionInstance = session || new Session();
    super("region", sessionInstance);
  }

  async getById(id: string | number) {
    const object = await super.getById(id);
    // @ts-ignore
    delete object.geom;
    return object;
  }
}