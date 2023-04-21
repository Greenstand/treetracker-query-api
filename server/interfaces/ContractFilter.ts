import DbModel from './DbModel';

interface ContractFilter extends DbModel {
  id?: number | undefined;
  agreement_id?: number | undefined;
  worker_id?: number | undefined;
  status?: string | undefined;
  notes?: string | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
  signed_at?: string | undefined;
  closed_at?: string | undefined;
  listed?: true | false;
}

export default ContractFilter;
