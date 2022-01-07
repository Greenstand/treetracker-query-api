import TreeRepository from "infra/database/TreeRepository";
import log from "loglevel";
import { delegateRepository } from "../infra/database/delegateRepository";

export type Tree = {
  id: number,
  lat: number,
  lon: number,
}

function getByFilter(treeRepository: TreeRepository): (filter: any, options: any) => Promise<Tree[]> {
  return async function(filter: any, options: any) {
    if(filter.organization_id){
      log.warn("using org filter...");
      const trees = await treeRepository.getByOrganization(filter.organization_id,options);
      return trees;
    }else{
      const trees = await treeRepository.getByFilter(filter, options);
      return trees;
    }
  };
}

export default {
  getById: delegateRepository(TreeRepository, "getById"),
  getByFilter,
}