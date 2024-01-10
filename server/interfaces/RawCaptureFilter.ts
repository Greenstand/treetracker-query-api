import DbModel from './DbModel';

interface RawCaptureFilter extends DbModel {
  organization_id?: Array<string> | undefined;
  reference_id?: string | undefined;
  session_id?: string | undefined;
  grower_account_id?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  id?: string | undefined;
  species_id?: string | undefined;
  tag?: string | undefined;
  device_identifier?: string | undefined;
  wallet?: string | undefined;
  status?: string | undefined;
  sort?: { order?: string; order_by?: string };
}

export default RawCaptureFilter;
