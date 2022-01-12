import PlanterRepository from "infra/database/PlanterRepository";
import log from "loglevel";
import { delegateRepository } from "../infra/database/delegateRepository";

export type Planter = {
  id: number,
  first_name: string,
  last_name: string,
}

function getByFilter(planterRepository: PlanterRepository): (filter: any, options: any) => Promise<Planter[]> {
  return async function(filter: any, options: any) {
    if(filter.organization_id){
      log.warn("using org filter...");
      const trees = await planterRepository.getByOrganization(filter.organization_id,options);
      return trees;
    }else{
      const trees = await planterRepository.getByFilter(filter, options);
      return trees;
    }
  };
}

export default {
  getById: delegateRepository(PlanterRepository, "getById"),
  getByFilter,
}