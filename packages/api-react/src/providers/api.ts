import { createContext } from 'react';

export const ApiContext = createContext({
  handlers: {
    onError: (err: string) => console.error(err)
  }
});

export const ApiProvider = ApiContext.Provider;
