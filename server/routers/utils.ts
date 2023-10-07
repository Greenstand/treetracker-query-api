/*
 * Some utils for router/express
 */
import { ValidationError } from 'joi';
import log from 'loglevel';
import HttpError from '../utils/HttpError';

/*
 * This is from the library https://github.com/Abazhenov/express-async-handler
 * Made some customization for our project. With this, we can throw Error from
 * the handler function or internal function call stack, and parse the error,
 * send to the client with appropriate response (http error code & json body)
 *
 * USAGE: wrap the express handler with this function:
 *
 *  router.get("/xxx", handlerWrap(async (res, rep) => {
 *    ...
 *  }));
 *
 *  Then, add the errorHandler below to the express global error handler.
 *
 */
const handlerWrapper = (fn) =>
  function wrap(...args) {
    const fnReturn = fn(...args);
    const next = args[args.length - 1];
    return Promise.resolve(fnReturn).catch((e) => {
      next(e);
    });
  };

const errorHandler = (err, _req, res, _next) => {
  if (process.env.NODE_LOG_LEVEL === 'debug') {
    log.error('catch error:', err);
  } else {
    log.error('catch error:', err);
  }
  if (err instanceof HttpError) {
    res.status(err.code).send({
      code: err.code,
      message: err.message,
    });
  } else if (err instanceof ValidationError) {
    res.status(422).send({
      code: 422,
      message: err.details.map((m) => m.message).join(';'),
    });
  } else {
    res.status(500).send({
      code: 500,
      message: `Unknown error (${err.message})`,
    });
  }
};

const queryFormatter = (req) => {
  const { whereNulls, whereNotNulls, whereIns, organization_id, ...others } =
    req.query;

  // parse values before verifying
  const query = {
    whereNulls: whereNulls?.length ? JSON.parse(whereNulls) : [],
    whereNotNulls: whereNotNulls?.length ? JSON.parse(whereNotNulls) : [],
    whereIns: whereIns?.length ? JSON.parse(whereIns) : [],
    ...others,
  };
  if (req.query.organization_id) {
    query.organization_id = JSON.parse(req.query.organization_id);
  }

  if (req.query.captures_amount_min) {
    query.captures_amount_min = parseInt(req.query.captures_amount_min);
  }

  if (req.query.captures_amount_max) {
    query.captures_amount_max = parseInt(req.query.captures_amount_max);
  }

  return query;
};

export { handlerWrapper, errorHandler, queryFormatter };
