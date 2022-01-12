import OrganizationRepository from "../infra/database/OrganizationRepository";
import log from "loglevel";
import { delegateRepository } from "../infra/database/delegateRepository";

export type Organization = {
  id: number,
  first_name: string,
  last_name: string,
}

function getByFilter(organizationRepository: OrganizationRepository): (filter: any, options: any) => Promise<Organization[]> {
  return async function(filter: any, options: any) {
    if(filter.planter_id){
      log.warn("using planter filter...");
      const trees = await organizationRepository.getByPlanter(filter.planter_id,options);
      return trees;
    }else{
      const trees = await organizationRepository.getByFilter(filter, options);
      return trees;
    }
  };
}

export default {
  getById: delegateRepository(OrganizationRepository, "getById"),
  getByFilter,
}