import DbModel from './DbModel';

export default interface Tokens extends DbModel {
  id: string;
  capture_id: string;
  wallet_id: string;
  transfer_pending: boolean;
  transfer_pending_id: string;
  created_at: string;
  updated_at: string;
  claim: boolean;
}
