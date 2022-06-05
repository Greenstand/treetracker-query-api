import log from 'loglevel';
import CaptureRepository from 'infra/database/CaptureRepository';
import { delegateRepository } from 'infra/database/delegateRepository';
import Capture from 'interfaces/Capture';
import CaptureFilter from 'interfaces/CaptureFilter';
import FilterOptions from 'interfaces/FilterOptions';

function getByFilter(
  captureRepository: CaptureRepository,
): (filter: CaptureFilter, options: FilterOptions) => Promise<Capture[]> {
  return async function (filter: CaptureFilter, options: FilterOptions) {
    const captures = await captureRepository.getByFilter(filter, options);
    return captures;
  };
}

export default {
  getByFilter,
  getById: delegateRepository<CaptureRepository, Capture>('getById'),
};
