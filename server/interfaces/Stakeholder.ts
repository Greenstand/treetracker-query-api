import DbModel from './DbModel';

export default interface Stakeholder extends DbModel {
  id: string;
  type: string;
  org_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  website: string;
}
