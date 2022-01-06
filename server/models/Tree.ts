import TreeRepository from "infra/database/TreeRepository";
import { delegateRepository } from "../infra/database/delegateRepository";

export type Tree = {
  id: number,
  lat: number,
  lon: number,
}

export default {
  getById: delegateRepository(TreeRepository, "getById"),
  getByFilter: delegateRepository(TreeRepository, "getByFilter"),
}