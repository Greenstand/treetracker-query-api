export default interface Organization {
  id: number;
  first_name: string;
  last_name: string;
  links: {
    featured_trees: string;
    associated_planters: string;
    species: string;
  };
}
