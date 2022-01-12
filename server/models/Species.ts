import SpeciesRepository from "../infra/database/SpeciesRepository";
import log from "loglevel";
import { delegateRepository } from "../infra/database/delegateRepository";

export type Species = {
  id: number,
  first_name: string,
  last_name: string,
}

function getByFilter(speciesRepository: SpeciesRepository): (filter: any, options: any) => Promise<Species[]> {
  return async function(filter: any, options: any) {
    if(filter.organization_id){
      log.warn("using org filter...");
      const trees = await speciesRepository.getByOrganization(filter.organization_id,options);
      return trees;
    }else if(filter.planter_id){
      log.warn("using planter filter...");
      const trees = await speciesRepository.getByPlanter(filter.planter_id,options);
      return trees;
    }else{
      const trees = await speciesRepository.getByFilter(filter, options);
      return trees;
    }
  };
}

export default {
  getById: delegateRepository(SpeciesRepository, "getById"),
  getByFilter,
}