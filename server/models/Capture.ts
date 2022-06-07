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

function getCount(
  captureRepository: CaptureRepository,
): (filter: CaptureFilter) => Promise<Capture[]> {
  return async function (filter: CaptureFilter) {
    const count = await captureRepository.getCount(filter);
    return count;
  };
}

export default {
  getByFilter,
  getCount,
  getById: delegateRepository<CaptureRepository, Capture>('getById'),
};
