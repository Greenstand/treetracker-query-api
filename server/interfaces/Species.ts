export default interface Species {
  id: number;
  name: string;
  desc: string;
  active: boolean;
  value_factor: number;
  uuid: string;
  total?: number;
}
