import DbModel from './DbModel';

interface GrowerAccountFilter extends DbModel {
  id?: number;
  first_name?: string;
  last_name?: string;
  limit?: number;
  offset?: number;
  keyword?: string;
  organization_id?: string[] | string;
  person_id?: string;
  device_identifier?: string;
  wallet?: string;
  email?: string;
  phone?: string;
  captures_amount_min?: number;
  captures_amount_max?: number;
}

export default GrowerAccountFilter;
