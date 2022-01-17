import TreeRepository from "../infra/database/TreeRepository";
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

/*
 featured tree, some highlighted tree, for a tempororily solution
 we just put the newest, verified tree
 */
function getFeaturedTree(treeRepository: TreeRepository){
  return async function(){
    // const trees = await treeRepository.getByFilter(
    //   {
    //     approved: true, 
    //   }, {limit: 10});
    const trees : Array<Tree> = [];
    for(const id of [186737, 186735, 186736, 186734]){
      const tree = await treeRepository.getById(id);
      trees.push(tree);
    }
    return trees;
  };

}

export default {
  getById: delegateRepository(TreeRepository, "getById"),
  getByFilter,
  getFeaturedTree,
}