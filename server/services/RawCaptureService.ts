import Session from 'infra/database/Session';
import FilterOptions from 'interfaces/FilterOptions';
import RawCaptureFilter from 'interfaces/RawCaptureFilter';
import RawCaptureModel from 'models/RawCapture';

export default class RawCaptureService {
  private session = new Session();
  private rawCaptureModel = new RawCaptureModel(this.session);

  getRawCaptures(filter: RawCaptureFilter, options: FilterOptions) {
    return this.rawCaptureModel.getRawCaptures(filter, options);
  }

  getRawCaptureById(rawCaptureId: string) {
    return this.rawCaptureModel.getRawCaptureById(rawCaptureId);
  }

  getRawCapturesCount(filter: RawCaptureFilter) {
    return this.rawCaptureModel.getRawCapturesCount(filter);
  }
}
