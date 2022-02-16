type Filter<T = unknown> = {
  planter_id?: number;
  organization_id?: number;
  lat?: number;
  lon?: number;
  token_id?: string;
  wallet_id?: string;
} & T;

export default Filter;
