import Bounds from 'interfaces/Bounds';
import HttpError from 'utils/HttpError';
import Session from './Session';

export default class BoundsRepository {
  session: Session;

  constructor(session: Session) {
    this.session = session;
  }

  async filterByPlanter(planterId: string): Promise<Bounds> {
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
    return BoundsRepository.convertStringToBounds(bounds);
  }

  async filterByWallet(walletId: string): Promise<Bounds> {
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
    return BoundsRepository.convertStringToBounds(bounds);
  }

  async filterByOrganisation(
    organisationId: string[] | string,
  ): Promise<Bounds> {
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
    return BoundsRepository.convertStringToBounds(bounds);
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
}
