export default interface Transaction {
  id: string;
  token_id: string;
  source_wallet_id: string;
  destination_wallet_id: string;
  source_wallet_name: string;
  destination_wallet_name: string;
  processed_at: string;
  source_wallet_logo_url: string;
}
