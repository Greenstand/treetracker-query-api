import { SwaggerOptions } from 'swagger-ui-express';
import { version } from '../../package.json';
import { boundsSwagger, boundsComponent } from './boundsHandler/docs';
import { speciesSwagger, speciesComponent } from './speciesHandler/docs';
import {
  transactionSwagger,
  transactionComponent,
} from './transactionHandler/docs';

const paths = {
  ...boundsSwagger,
  ...speciesSwagger,
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
      Bounds: { ...boundsComponent },
      Species: { ...speciesComponent },
      Transaction: { ...transactionComponent },
    },
  },
};

export default swaggerDefinition;
