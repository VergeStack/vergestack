import { createContext } from 'react';
import { ApiContextType, ApiErrorWithMetadata } from '../types';

export const ApiContext = createContext<ApiContextType>({
  handlers: {
    onError: (errors: ApiErrorWithMetadata[]) => {
      for (const err of errors) {
        if ('reason' in err && err.isReasonRegistered) continue;

        const suffix = 'reason' in err ? ` with reason: ${err.reason}` : '';
        console.error(`${err.message}${suffix}`);
      }
    },
    onSuccess: () => {},
    onComplete: () => {}
  }
});

export const ApiProvider = ApiContext.Provider;
