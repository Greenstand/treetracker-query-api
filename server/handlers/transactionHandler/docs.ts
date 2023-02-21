import j2s from 'joi-to-swagger';
import { transactionGetQuerySchema } from './schemas';

const { swagger: transactionGetSwagger } = j2s(transactionGetQuerySchema);

export const transactionSwagger = {
  '/transactions': {
    get: {
      tags: ['transactions'],
      summary: 'get transactions',
      parameters: [
        {
          schema: {
            ...transactionGetSwagger,
          },
          in: 'query',
          name: 'query',
          description: 'Allowed query parameters',
        },
      ],
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  offset: { type: 'number' },
                  limit: { type: 'number' },
                  transactions: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Transaction',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const transactionComponent = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    token_id: { type: 'string', format: 'uuid' },
    source_wallet_id: { type: 'string', format: 'uuid' },
    destination_wallet_id: { type: 'string', format: 'uuid' },
    source_wallet_name: { type: 'string' },
    destination_wallet_name: { type: 'string' },
    processed_at: { type: 'string', format: 'date-time' },
    source_wallet_logo_url: { type: 'string' },
  },
};
