import { Country } from "models/Country";
import HttpError from "utils/HttpError";
import BaseRepository from "./BaseRepository";
import Session from "./Session";

export default class TreeRepository extends BaseRepository<Country> {
  constructor(session: Session) {
    super("trees", session);
  }

}



