import { ApiResponseStatus } from '@vergestack/api';
import { ApiErrorWithMetadata } from '../types';

export function isSuccessStatus(status: ApiResponseStatus): boolean {
  return status >= 200 && status < 300;
}

export function defaultOnError(errors: ApiErrorWithMetadata[]) {
  for (const err of errors) {
    if ('reason' in err) {
      const message = `${err.message} with reason: ${err.reason}`;

      console[err.isReasonRegistered ? 'info' : 'error'](message);

      return;
    }

    console.error(err.message);
  }
}
