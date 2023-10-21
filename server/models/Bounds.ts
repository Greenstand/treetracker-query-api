import log from 'loglevel';
import BoundsRepository from 'infra/database/BoundsRepository';
import Bounds from 'interfaces/Bounds';

type BoundsFilter = Partial<{
  planter_id: string;
  wallet_id: string;
  organisation_id: string[] | string;
}>;

function getByFilter(
  boundsRepository: BoundsRepository,
): (filter: BoundsFilter) => Promise<Bounds | undefined> {
  // eslint-disable-next-line func-names
  return async function (filter: BoundsFilter) {
    if (filter.planter_id) {
      log.warn(`getting bounds using planterId ${filter.planter_id}`);
      const bounds = await boundsRepository.filterByPlanter(filter.planter_id);
      return bounds;
    }

    if (filter.wallet_id) {
      log.warn(`getting bounds using  wallet_id ${filter.wallet_id}`);
      const bounds = await boundsRepository.filterByWallet(filter.wallet_id);
      return bounds;
    }

    if (filter.organisation_id) {
      log.warn(
        `getting bounds using  organisation_id ${filter.organisation_id}`,
      );
      const bounds = await boundsRepository.filterByOrganisation(
        filter.organisation_id,
      );
      return bounds;
    }
  };
}

export default {
  getByFilter,
};
