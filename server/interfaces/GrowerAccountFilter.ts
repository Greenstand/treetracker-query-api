type GrowerAccountFilter = Partial<{
  id: number;
  first_name: string;
  last_name: string;
  limit: number;
  offset: number;
  keyword: string;
  organization_id: string;
  person_id: string;
  device_identifier: string;
  wallet: string;
  email: string;
  phone: string;

  // Filters for future:

  // first_registration_at: string;
  // created_at: string;
  // updated_at: string;
  // location: string;
  // lon: string;
  // lat: string;
}>;

export default GrowerAccountFilter;
