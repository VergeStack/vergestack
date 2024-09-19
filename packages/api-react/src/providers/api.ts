import { ErrorMessage } from '@vergestack/api';
import { createContext } from 'react';

export const ApiContext = createContext({
  handlers: {
    onError: (err: ErrorMessage, supressed: boolean = false) => {
      if (supressed) return;

      const suffix = err.path ? ` at path ${err.path}` : '';
      console.error(`${err.message}${suffix}`);
    }
  }
});

export const ApiProvider = ApiContext.Provider;
