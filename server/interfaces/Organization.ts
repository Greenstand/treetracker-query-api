import DbModel from './DbModel';

export default interface Organization extends DbModel {
  id: number;
  first_name: string;
  last_name: string;
  links: {
    featured_trees: string;
    associated_planters: string;
    species: string;
  };
}
