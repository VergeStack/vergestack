import { createContext } from 'react';
import { ApiContextType } from '../types';

export const ApiContext = createContext<ApiContextType>({
  options: {}
});

export const ApiProvider = ApiContext.Provider;
