import Stakeholder from 'interfaces/Stakeholder';
import { delegateRepository } from '../infra/database/delegateRepository';
import StakeholderRepositoryV2 from '../infra/database/StakeholderRepositoryV2';

export default {
  getById: delegateRepository<StakeholderRepositoryV2, Stakeholder>('getById'),
};
