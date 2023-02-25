import { Request, Response, RequestHandler } from 'express';
import { TokenFilter } from 'models/Tokens';
import TokenService from 'services/TokenService';
import FilterOptions from 'interfaces/FilterOptions';
import { tokenIdSchema, tokenGetQuerySchema } from './schemas';

export const tokenGet: RequestHandler = async (req: Request, res: Response) => {
  await tokenGetQuerySchema.validateAsync(req.query, { abortEarly: false });

  const { withCapture, withPlanter, wallet } = req.query;
  const { limit = 20, offset = 0 }: FilterOptions = req.query;

  const filter: TokenFilter = { wallet: String(wallet) };
  if (withCapture) filter.withCapture = withCapture === 'true';
  if (withPlanter) filter.withPlanter = withPlanter === 'true';

  const tokenService = new TokenService();
  const tokens = await tokenService.getTokens(filter, {
    limit,
    offset,
  });
  const count = await tokenService.getTokensCount(filter);

  res.send({
    total: count,
    offset,
    limit,
    tokens,
  });
  res.end();
};

export const tokenGetById: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  console.log('hereeeeee');
  await tokenIdSchema.validateAsync(req.params, { abortEarly: false });
  const tokenService = new TokenService();
  const result = await tokenService.getTokenById(req.params.token_id);
  res.send(result);
  res.end();
};
