export default interface Token {
  id: string;
  capture_id: string;
  wallet_id: string;
  transfer_pending: boolean;
  transfer_pending_id: string;
  created_at: string;
  updated_at: string;
  claim: boolean;
  tree_id?: number;
  tree_image_url?: string;
  tree_species_name?: string;
}
