import DbModel from './DbModel';

interface CaptureLocationFilter extends DbModel {
  session_id?: Array<string> | undefined;
  lat?: string | undefined;
  lon?: string | undefined;
  deviation?: string | undefined;
  sort?: { order?: string; order_by?: string };
}

export default CaptureLocationFilter;
