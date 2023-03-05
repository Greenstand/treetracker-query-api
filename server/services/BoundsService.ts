import Session from 'infra/database/Session';
import BoundsModel, { BoundsFilter } from 'models/Bounds';

export default class BoundsService {
  private session = new Session();
  private boundsModel = new BoundsModel(this.session);

  async getBounds(filter: BoundsFilter) {
    return this.boundsModel.getBounds(filter);
  }
}
