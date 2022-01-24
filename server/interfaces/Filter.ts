type Filter<T = unknown> = {
  planter_id?: number;
  organization_id?: number;
  lat?: number;
  lon?: number;
} & T;

export default Filter;
