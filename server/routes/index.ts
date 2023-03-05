import { Router } from 'express';

import organizationsRouterV2 from './organizationsRouterV2';
import boundsRouter from './boundsRouter';
import capturesRouter from './capturesRouter';
import countriesRouter from './countriesRouter';
import growerAccountsRouter from './growerAccountsRouter';
import organizationsRouter from './organizationsRouter';
import plantersRouter from './plantersRouter';
import rawCapturesRouter from './rawCapturesRouter';
import speciesRouter from './speciesRouter';
import tokensRouter from './tokensRouter';
import transactionsRouter from './transactionsRouter';
import treesRouter from './treesRouter';
import treesRouterV2 from './treesRouterV2';
import walletsRouter from './walletsRouter';

const routers: Router[] = [
  boundsRouter,
  transactionsRouter,
  speciesRouter,
  rawCapturesRouter,
  tokensRouter,
  walletsRouter,
];

export default routers;
