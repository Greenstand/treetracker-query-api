import Capture from 'interfaces/Capture';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class CaptureRepository extends BaseRepository<Capture> {
  constructor(session: Session) {
    super('capture', session);
  }

  async getById(id: string) {
    const sql = `
            SELECT 
              *
            FROM treetracker.capture
            WHERE id = '${id}'
        `;
    const object = await this.session.getDB().raw(sql);
    return object.rows[0];
  }
}
