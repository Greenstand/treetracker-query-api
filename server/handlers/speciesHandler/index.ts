import log from 'loglevel';
import { Request, Response, RequestHandler } from 'express';
import { speciesIdSchema, speciesGetQuerySchema } from './schemas';
import { SpeciesFilter } from 'models/Species';
import FilterOptions from 'interfaces/FilterOptions';
import SpeciesService from 'services/SpeciesService';

export const speciesGet: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  await speciesGetQuerySchema.validateAsync(req.query, { abortEarly: false });
  const speciesService = new SpeciesService();
  let { limit = 20, offset = 0 }: FilterOptions = req.query;
  const { planter_id, organization_id, wallet_id }: SpeciesFilter = req.query;
  const begin = Date.now();
  const result = await speciesService.getSpecies(
    { planter_id, organization_id, wallet_id },
    {
      limit,
      offset,
    },
  );
  log.warn(
    'species filter:',
    { planter_id, organization_id, wallet_id },
    'took time:',
    Date.now() - begin,
    'ms',
  );
  res.send({
    total: result.count,
    offset,
    limit,
    species: result.species,
  });
  res.end();
};

export const speciesGetById: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  speciesIdSchema.validateAsync(req.params, { abortEarly: false });
  const speciesService = new SpeciesService();
  const result = await speciesService.getSpeciesById(+req.params.species_id);
  res.send(result);
  res.end();
};
