import { delegateRepository } from 'infra/database/delegateRepository';
import RawCaptureRepository from 'infra/database/RawCaptureRepository';
import RawCapture from 'interfaces/Capture';
import RawCaptureFilter from 'interfaces/CaptureFilter';
import FilterOptions from 'interfaces/FilterOptions';

function getByFilter(
  rawCaptureRepository: RawCaptureRepository,
): (filter: RawCaptureFilter, options: FilterOptions) => Promise<RawCapture[]> {
  return async function (filter: RawCaptureFilter, options: FilterOptions) {
    const captures = await rawCaptureRepository.getByFilter(filter, options);
    return captures;
  };
}

function getCount(
  rawCaptureRepository: RawCaptureRepository,
): (filter: RawCaptureFilter) => Promise<string | number> {
  return async function (filter: RawCaptureFilter) {
    const count = await rawCaptureRepository.getCount(filter);
    return count;
  };
}

export default {
  getByFilter,
  getCount,
  getById: delegateRepository<RawCaptureRepository, RawCapture>('getById'),
};
