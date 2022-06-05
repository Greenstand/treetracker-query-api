import log from 'loglevel';
import CaptureRepository from 'infra/database/CaptureRepository';
import { delegateRepository } from 'infra/database/delegateRepository';
import Capture from 'interfaces/Capture';
import FilterOptions from 'interfaces/FilterOptions';

type Filter = Partial<{
  date_range: { startDate: string; endDate: string };
  id: string;
  tree_id: string;
  planting_organization_id: string;
  image_url: string;
  lat: string;
  lon: string;
  status: string;
  grower_account_id: string;
  morphology: string;
  age: number;
  note: string;
  attributes: string;
  species_id: string;
  session_id: string;
  tag: string;
  sort: { order: string; order_by: string };
}>;

function getByFilter(
  captureRepository: CaptureRepository,
): (filter: Filter, options: FilterOptions) => Promise<Capture[]> {
  return async function (filter: Filter, options: FilterOptions) {
    // if (filter.planting_organization_id) {
    //   log.warn('using org filter...');
    //   const captures = await captureRepository.getByOrganization(
    //     filter.planting_organization_id,
    //     options,
    //   );
    //   return captures;
    // }
    // if (filter.date_range) {
    //   log.warn('using date range filter...');
    //   const captures = await captureRepository.getByDateRange(
    //     filter.date_range,
    //     options,
    //   );
    //   return captures;
    // }
    // if (filter.tag) {
    //   log.warn('using tag filter...');
    //   const captures = await captureRepository.getByTag(filter.tag, options);
    //   return captures;
    // }
    const captures = await captureRepository.getByFilter(filter, options);
    return captures;
  };
}

export default {
  getByFilter,
  getById: delegateRepository<CaptureRepository, Capture>('getById'),
};
