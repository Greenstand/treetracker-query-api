type Bounds = {
  ne: [lat: number, lon: number];
  se: [lat: number, lon: number];
};

export type BoundsCoordinate = { lat: number; lon: number };

export type InitialBoundsFilter = {
  planter_id?: string;
  wallet_id?: string;
  organisation_id?: string;
};

export default Bounds;
