export class HandledPromiseError extends Error {
  handledPromiseError = true;
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
    console.log(new HandledPromiseError(message, causedBy) instanceof HandledPromiseError, 'testing assumptions');
    if (causedBy.handledPromiseError) {
      console.error('Ignoring future failures');
      return Promise.reject(causedBy)
    }
    console.error('Caught first Rejection', message, causedBy);
    return Promise.reject(new HandledPromiseError(message, causedBy))
  }

}