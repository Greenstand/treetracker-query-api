import DbModel from './DbModel';

export default interface GrowerAccount extends DbModel {
  id: number;
  first_name: string;
  last_name: string;
  links: {
    featured_trees: string;
    associated_organizations: string;
    species: string;
  };
}
