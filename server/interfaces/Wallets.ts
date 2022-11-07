import DbModel from './DbModel';

export default interface Wallets extends DbModel {
  id: string;
  name: string;
  password: string;
  salt: string;
  logo_url: string;
  created_at: string;
}
