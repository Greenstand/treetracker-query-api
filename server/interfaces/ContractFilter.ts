import DbModel from './DbModel';

interface ContractFilter extends DbModel {
  // organization_id?: Array<string> | undefined;
  // grower_account_id?: string | undefined;
  // id?: string | undefined;
  // tree_id?: string | undefined;
  // species_id?: string | undefined;
  // tag?: string | undefined;
  // device_identifier?: string | undefined;
  // wallet?: string | undefined;
  // token_id?: string | undefined;
  // tokenized?: string | undefined;

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
