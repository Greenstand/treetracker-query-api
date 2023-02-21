import cors from 'cors';
import express from 'express';
import log from 'loglevel';
import swaggerUi, { SwaggerUiOptions } from 'swagger-ui-express';
import swaggerDocument from './handlers/swaggerDoc';
import responseTime from 'response-time';
import router from './routes';
import { errorHandler, handlerWrapper } from './routes/utils';
import HttpError from './utils/HttpError';
import { join } from 'path';
import { version } from '../package.json';

const app = express();

// Sentry.init({ dsn: config.sentry_dsn });

// app.use(
//   responseTime((req, res, time) => {
//     log.warn('API took:', req.originalUrl, time);
//   }),
// );

// app allow cors
app.use(cors());

/*
 * Check request
 */
app.use(
  handlerWrapper((req, _res, next) => {
    if (
      req.method === 'POST' ||
      req.method === 'PATCH' ||
      req.method === 'PUT'
    ) {
      if (req.headers['content-type'] !== 'application/json') {
        throw new HttpError(
          415,
          'Invalid content type. API only supports application/json',
        );
      }
    }
    next();
  }),
);

const options: SwaggerUiOptions = {
  customCss: `
    .topbar-wrapper img { 
      content:url('../assets/greenstand.webp');
      width:80px; 
      height:auto;
    }
    `,
  explorer: true,
};

app.use('/assets', express.static(join(__dirname, '..', '/assets')));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.json()); // parse application/json

// routers
// app.use('/countries', countriesRouter);
// app.use('/v2/countries', countriesRouter);
// app.use('/trees', treesRouter);
// app.use('/planters', plantersRouter);
// app.use('/organizations', organizationsRouter);
// app.use('/v2/organizations', organizationsRouterV2);

// app.use('/wallets', walletsRouter);
// app.use('/v2/wallets', walletsRouter);
// app.use('/tokens', tokensRouter);
// app.use('/v2/tokens', tokensRouter);
// app.use('/v2/captures', capturesRouter);
// app.use('/raw-captures', rawCapturesRouter);
// app.use('/v2/growers', growerAccountsRouter);
// app.use('/v2/trees', treesRouterV2);

app.use('/', router);

// Global error handler
app.use(errorHandler);

app.get('*', (req, res) => {
  res.status(404).send(version);
});

export default app;
