export class HandledPromiseError extends Error {
  constructor(public message:string, public causedBy?:any) {
    super(message);
  }
}
/**
 * Curried function to reject with a nice message, pass in like this
 * prom.then(() => badstuff)
 *   .catch(rejectFirst('failure message'))
 */
export function rejectFirst(message:string) {
  return function(causedBy) {
    if (causedBy instanceof HandledPromiseError) {
      console.error('Caught first Rejection', message);
      return Promise.reject(causedBy)
    }
    return Promise.reject(new HandledPromiseError(message, causedBy))
  }

}