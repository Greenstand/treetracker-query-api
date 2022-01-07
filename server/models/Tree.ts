import TreeRepository from "infra/database/TreeRepository";
import { delegateRepository } from "../infra/database/delegateRepository";

export type Tree = {
  id: number,
  lat: number,
  lon: number,
}

function getByFilter(treeRepository: TreeRepository): (filter: any, options: any) => Promise<Tree[]> {
  return async function(filter: any, options: any) {
    const trees = await treeRepository.getByFilter(filter, options);
    return trees;
  };
}

export default {
  getById: delegateRepository(TreeRepository, "getById"),
  getByFilter,
}