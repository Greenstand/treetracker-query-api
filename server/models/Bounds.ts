import log from 'loglevel';
import BoundsRepository from 'repositories/BoundsRepository';
import Bounds from 'interfaces/Bounds';
import Session from 'infra/database/Session';

export type BoundsFilter = Partial<{
  planter_id: number;
  wallet_id: number;
  organisation_id: string;
}>;

export default class BoundsModel {
  private boundsRepository: BoundsRepository;
  constructor(session: Session) {
    this.boundsRepository = new BoundsRepository(session);
  }

  static convertStringToBounds(boundString: string): Bounds {
    // result that we get back from db
    // BOX(-165.75204 -87.53491,178.08949 82.28428)
    const trimmedString = boundString.slice(4, boundString.length - 2);
    const lngLatStrArr = trimmedString.split(',');
    const lngLatNumArr = lngLatStrArr.map((coorStr) =>
      coorStr.split(' ').map((str) => Number(str)),
    );
    return {
      ne: [lngLatNumArr[0][1], lngLatNumArr[0][0]],
      se: [lngLatNumArr[1][1], lngLatNumArr[1][0]],
    };
  }

  async getBounds(filter: BoundsFilter): Promise<Bounds | undefined> {
    if (filter.planter_id) {
      log.warn(`getting bounds using planterId ${filter.planter_id}`);
      const bounds = await this.boundsRepository.filterByPlanter(
        filter.planter_id,
      );
      return BoundsModel.convertStringToBounds(bounds);
    }

    if (filter.wallet_id) {
      log.warn(`getting bounds using  wallet_id ${filter.wallet_id}`);
      const bounds = await this.boundsRepository.filterByWallet(
        filter.wallet_id,
      );
      return BoundsModel.convertStringToBounds(bounds);
    }

    if (filter.organisation_id) {
      log.warn(
        `getting bounds using  organisation_id ${filter.organisation_id}`,
      );
      const bounds = await this.boundsRepository.filterByOrganisation(
        filter.organisation_id,
      );
      return BoundsModel.convertStringToBounds(bounds);
    }
  }
}
