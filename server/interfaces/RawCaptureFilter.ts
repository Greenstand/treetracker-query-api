interface RawCaptureFilter {
  organization_id?: Array<string>;
  reference_id?: string;
  grower_account_id?: string;
  startDate?: string;
  endDate?: string;
  id?: string;
  species_id?: string;
  tag?: string;
  device_identifier?: string;
  wallet?: string;
  status?: 'unprocessed' | 'approved' | 'rejected';
  sort?: { order?: 'asc' | 'desc'; order_by?: string };
  bulk_pack_file_name?: string;
  tree_id?: string;
  tag_id?: string;
  tokenized?: boolean;
  token_id?: string;
  whereNulls?: Array<string>;
  whereNotNulls?: Array<string>;
  whereIns?: Array<{ field: string; values: Array<string> }>;
}

export default RawCaptureFilter;
