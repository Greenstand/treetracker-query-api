import DbModel from './DbModel';

export default interface Contract extends DbModel {
  id: number;
  agreement_id: number;
  worker_id: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  signed_at: string;
  closed_at: string;
  listed: true;
}
