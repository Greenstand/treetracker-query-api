import { Country } from "models/Country";
import BaseRepository from "./BaseRepository";
import Session from "./session";

export default class CountryRepository extends BaseRepository<Country> {
  constructor(session?: Session) {
    const sessionInstance = session || new Session();
    super("region", sessionInstance);
  }
}