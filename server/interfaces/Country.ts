import DbModel from './DbModel';

export default interface Country extends DbModel {
  name: string;
  code: string;
  lat: number;
  lon: number;
}
