import DbModel from './DbModel';

interface SpeciesFilter extends DbModel {
  id?: number;
  scientific_name?: string;
  description?: string;
  limit?: number;
  offset?: number;
  keyword?: string;
  morphology?: string;
  range?: string;
  created_at?: string;
  updated_at?: string;
}

export default SpeciesFilter;
