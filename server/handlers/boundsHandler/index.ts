import { Request, Response, RequestHandler } from 'express';
import BoundsService from '../../services/BoundsService';
import { boundsGetQuerySchema } from './schemas';

export const boundsGet: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  await boundsGetQuerySchema.validateAsync(req.query, { abortEarly: false });
  const boundsService = new BoundsService();
  const result = await boundsService.getBounds(req.query);
  res.send({
    bounds: result,
  });
  res.end();
};
