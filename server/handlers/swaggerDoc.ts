import { SwaggerOptions } from 'swagger-ui-express';
import { version } from '../../package.json';
import { boundsSwagger, boundsComponent } from './boundsHandler/docs';
import {
  rawCaptureComponent,
  rawCaptureGetByIdComponent,
  rawCaptureSwagger,
} from './rawCaptureHandler/docs';
import { speciesSwagger, speciesComponent } from './speciesHandler/docs';
import {
  tokenByIdComponent,
  tokenComponent,
  tokenSwagger,
} from './tokensHandler/docs';
import {
  transactionSwagger,
  transactionComponent,
} from './transactionHandler/docs';
import { walletComponent, walletSwagger } from './walletHandler/docs';

const paths = {
  ...tokenSwagger,
  ...boundsSwagger,
  ...walletSwagger,
  ...speciesSwagger,
  ...rawCaptureSwagger,
  ...transactionSwagger,
};

const swaggerDefinition: SwaggerOptions = {
  openapi: '3.0.0',
  info: {
    title: 'Treetracker Query API',
    version,
  },
  paths,
  components: {
    schemas: {
      Token: { ...tokenComponent },
      Bounds: { ...boundsComponent },
      Wallet: { ...walletComponent },
      Species: { ...speciesComponent },
      TokenById: { ...tokenByIdComponent },
      RawCapture: { ...rawCaptureComponent },
      Transaction: { ...transactionComponent },
      RawCaptureById: { ...rawCaptureGetByIdComponent },
    },
  },
};

export default swaggerDefinition;
