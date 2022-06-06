type CaptureFilter = Partial<{
  organization_ids: Array<string> | undefined;
  tree_associated: string | undefined;
  grower_account_id: string | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
  id: string | undefined;
  tree_id: string | undefined;
  species_id: string | undefined;
  tag: string | undefined;
  device_identifier: string | undefined;
  wallet: string | undefined;
  token: string | undefined;
  status: string | undefined;
  sort: { order: string; order_by: string };
}>;

export default CaptureFilter;
