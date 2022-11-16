import DbModel from './DbModel';

export default interface Species extends DbModel {
  id: number;
  first_name: string;
  last_name: string;
}
