import DbModel from './DbModel';

export default interface Capture extends DbModel {
  id: number;
  lat: number;
  lon: number;
  time_created: string;
}
