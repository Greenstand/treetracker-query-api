import CaptureRepository from 'infra/database/CaptureRepository';
import { delegateRepository } from 'infra/database/delegateRepository';
import Capture from 'interfaces/Capture';

export default {
  getById: delegateRepository<CaptureRepository, Capture>('getById'),
};
