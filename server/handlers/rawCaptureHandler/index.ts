import { Request, Response, RequestHandler } from 'express';
import { queryFormatter } from 'utils/utils';
import RawCaptureService from 'services/RawCaptureService';
import { rawCaptureIdSchema, rawCaptureQetQuerySchema } from './schemas';

export const rawCaptureGetCount: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const query = queryFormatter(req);
  await rawCaptureQetQuerySchema.validateAsync(query, {
    abortEarly: false,
  });

  const rawCaptureService = new RawCaptureService();
  const count = await rawCaptureService.getRawCapturesCount(query);
  res.send({
    count: +count,
  });
  res.end();
};

export const rawCaptureGetById: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  await rawCaptureIdSchema.validateAsync(req.params);
  const rawCaptureService = new RawCaptureService();
  const result = await rawCaptureService.getRawCaptureById(
    req.params.raw_capture_id,
  );
  res.send(result);
  res.end();
};

export const rawCaptureGet: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const query = queryFormatter(req);
  await rawCaptureQetQuerySchema.validateAsync(query, {
    abortEarly: false,
  });

  const {
    limit = 25,
    offset = 0,
    order = 'desc',
    order_by = 'captured_at',
    ...rest
  } = query;

  const rawCaptureService = new RawCaptureService();
  const sort = { order, order_by };
  const result = await rawCaptureService.getRawCaptures(
    { ...rest, sort },
    { limit, offset },
  );
  console.log(result[0]);
  const count = await rawCaptureService.getRawCapturesCount(rest);
  res.send({
    raw_captures: result,
    total: +count,
    offset,
    limit,
  });
  res.end();
};
