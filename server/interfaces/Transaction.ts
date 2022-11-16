import DbModel from './DbModel';

export default interface Transaction extends DbModel {
  id: string;
  token_id: string;
  source_wallet_id: string;
  destination_wallet_id: string;
  source_wallet_name: string;
  destination_wallet_name: string;
  processed_at: string;
  source_wallet_logo_url: string;
}
