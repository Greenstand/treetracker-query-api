import j2s from 'joi-to-swagger';
import { rawCaptureQetQuerySchema } from './schemas';

const { swagger: rawCaptureGetSwagger } = j2s(rawCaptureQetQuerySchema);

export const rawCaptureSwagger = {
  '/raw-captures': {
    get: {
      tags: ['raw_capture'],
      summary: 'get raw captures',
      parameters: [
        {
          schema: {
            ...rawCaptureGetSwagger,
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
                  raw_captures: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/RawCapture',
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
  '/raw-captures/{raw_capture_id}': {
    get: {
      tags: ['raw_capture'],
      summary: 'get a single raw capture',
      parameters: [
        {
          schema: { type: 'string', format: 'uuid' },
          in: 'path',
          required: true,
          name: 'raw_capture_id',
          description: 'id of raw capture to return',
        },
      ],
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RawCaptureById',
              },
            },
          },
        },
      },
    },
  },
  '/raw-captures/count': {
    get: {
      tags: ['raw_capture'],
      summary: 'get count of all raw captures',
      parameters: [
        {
          schema: {
            ...rawCaptureGetSwagger,
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
                  count: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const rawCaptureComponent = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    reference_id: { type: 'number' },
    image_url: { type: 'string' },
    lat: { type: 'number' },
    lon: { type: 'number' },
    gps_accuracy: { type: 'number' },
    note: { type: 'string' },
    abs_step_count: { type: 'number' },
    delta_step_count: { type: 'number' },
    rotation_matrix: { type: 'array', items: { type: 'number' } },
    session_id: { type: 'string', format: 'uuid' },
    rejection_reason: { type: 'string' },
    device_identifier: { type: 'string' },
    device_configuration_id: { type: 'string', format: 'uuid' },
    grower_account_id: { type: 'string', format: 'uuid' },
    wallet: { type: 'string' },
    user_photo_url: { type: 'string' },
    extra_attributes: { type: 'object' },
    status: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    captured_at: { type: 'string', format: 'date-time' },
    organization_id: { type: 'string', format: 'uuid' },
  },
};

export const rawCaptureGetByIdComponent = {
  type: 'object',
  properties: {
    ...rawCaptureComponent.properties,
    bulk_pack_file_name: { type: 'string' },
    tags: { type: 'array', items: { type: 'number' } },
    device_manufacturer: { type: 'string' },
    device_model: { type: 'string' },
    device_type: { type: 'string' },
    device_os_version: { type: 'string' },
    grower_reference_id: { type: 'number' },
    region_properties: { type: 'object' },
  },
};
