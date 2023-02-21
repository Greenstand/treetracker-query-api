interface CaptureFilter {
  organization_id?: Array<string>;
  reference_id?: string;
  grower_account_id?: string;
  startDate?: string;
  endDate?: string;
  id?: string;
  tree_id?: string;
  species_id?: string;
  tag?: string;
  device_identifier?: string;
  wallet?: string;
  token_id?: string;
  tokenized?: string;
  status?: string;
  sort?: { order: string; order_by: string };
}

export default CaptureFilter;
