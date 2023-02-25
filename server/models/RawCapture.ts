import RawCaptureRepository from 'repositories/RawCaptureRepository';
import Session from 'infra/database/Session';
import RawCapture from 'interfaces/RawCapture';
import RawCaptureFilter from 'interfaces/RawCaptureFilter';
import FilterOptions from 'interfaces/FilterOptions';

class RawCaptureModel {
  private rawCaptureRepository: RawCaptureRepository;
  constructor(session: Session) {
    this.rawCaptureRepository = new RawCaptureRepository(session);
  }

  async getRawCaptures(
    filter: RawCaptureFilter,
    options: FilterOptions,
  ): Promise<RawCapture[]> {
    const captures = await this.rawCaptureRepository.getByFilter(
      filter,
      options,
    );
    return captures;
  }

  async getRawCapturesCount(filter: RawCaptureFilter): Promise<number> {
    const count = await this.rawCaptureRepository.getCount(filter);
    return count;
  }

  async getRawCaptureById(rawCaptureId): Promise<RawCapture> {
    return this.rawCaptureRepository.getById(rawCaptureId);
  }
}

export default RawCaptureModel;
