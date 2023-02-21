import HttpError from 'utils/HttpError';
import Session from '../infra/database/Session';

export default class BoundsRepository {
  private session: Session;

  constructor(session: Session) {
    this.session = session;
  }

  async filterByPlanter(planterId: number): Promise<string> {
    const planterBoundsSql = `
			select  
				ST_EXTENT(ST_GeomFromText('POINT(' || t.lon || ' ' || t.lat || ')', 4326)) as bounds 
				from public.planter p
					left join public.trees t  on t.planter_id = p.id 
				where p.id = ${planterId};
			`;
    const { bounds } = (await this.session.getDB().raw(planterBoundsSql))
      .rows[0];
    if (!bounds) {
      throw new HttpError(
        404,
        `Can not found bounds for this planter ${planterId}`,
      );
    }
    console.log(bounds);
    return bounds;
  }

  async filterByWallet(walletId: number): Promise<string> {
    const walletBoundsSql = `
			select  
				ST_EXTENT(ST_GeomFromText('POINT(' || t.lon || ' ' || t.lat || ')', 4326)) as bounds
				from public.trees t
					inner join wallet.token tk  on tk.capture_id::text = t.uuid 
				where tk.wallet_id = ${walletId} 
			`;
    const { bounds } = (await this.session.getDB().raw(walletBoundsSql))
      .rows[0];
    if (!bounds) {
      throw new HttpError(
        404,
        `Can not found bounds for this wallet ${walletId}`,
      );
    }
    return bounds;
  }

  async filterByOrganisation(organisationId: string): Promise<string> {
    const organisationBoundsSql = `
			select  
				ST_EXTENT(ST_GeomFromText('POINT(' || t.lon || ' ' || t.lat || ')', 4326)) as bounds
				from public.entity e 
					inner join public.planter p  on e.id = p.organization_id 
					inner join public.trees t  on t.planter_id = p.id 
				where e.id = ${organisationId};
			`;
    const { bounds } = (await this.session.getDB().raw(organisationBoundsSql))
      .rows[0];
    if (!bounds) {
      throw new HttpError(
        404,
        `Could not found bounds for this organisation ${organisationId}`,
      );
    }
    return bounds;
  }
}
