/*
 * To define a extended error for API, can pass through the error message, http
 * code, to bring some convenient for the internal class to throw out the error
 * and the outside of the layer can catch the error and convert to a http
 * response to client
 */

export default class HttpError extends Error {
  code: number;

  toRollback: boolean;

  constructor(code: number, message: string, toRollback = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.code = code;
    // set rollback flag, so the transaction of db would rollback when catch this error
    // set default to true
    this.toRollback = toRollback;
  }

  shouldRollback() {
    return this.toRollback;
  }
}
