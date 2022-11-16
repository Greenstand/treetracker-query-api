import DbModel from './DbModel';

export default interface Tree extends DbModel {
  id: number;
  lat: number;
  lon: number;
  time_created: string;
}
