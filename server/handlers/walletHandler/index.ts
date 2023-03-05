import { RequestHandler, Request, Response } from 'express';
import FilterOptions from 'interfaces/FilterOptions';
import { WalletFilter } from 'models/Wallet';
import WalletService from 'services/WalletService';
import { walletIdOrNameSchema, walletQuerySchema } from './schemas';

export const walletGet: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  walletQuerySchema.validateAsync(req.query, { abortEarly: false });
  const { limit = 20, offset = 0 }: FilterOptions = req.query;
  const { name } = req.query;
  const walletService = new WalletService();
  const filter: WalletFilter = {};
  if (name) {
    filter.name = String(name);
  }

  const result = await walletService.getWallets(filter, {
    limit,
    offset,
  });
  const count = await walletService.getWalletsCount(filter);
  res.send({
    total: count,
    offset,
    limit,
    wallets: result,
  });
  res.end();
};

export const walletGetByIdOrName: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  await walletIdOrNameSchema.validateAsync(req.params, { abortEarly: false });
  const walletService = new WalletService();
  const result = await walletService.getWalletsByIdOrName(
    req.params.wallet_id_or_name,
  );
  res.send(result);
  res.end();
};

export const walletGetFeatured: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const walletService = new WalletService();
  const wallets = await walletService.getFeaturedWallets();
  res.send({ wallets });
  res.end();
};

export const walletGetTokenRegionCount: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  await walletIdOrNameSchema.validateAsync(req.params, { abortEarly: false });
  const walletService = new WalletService();

  const result = await walletService.getWalletTokenRegionCount(
    req.params.wallet_id_or_name,
  );
  res.send({
    walletStatistics: result,
  });
  res.end();
};
