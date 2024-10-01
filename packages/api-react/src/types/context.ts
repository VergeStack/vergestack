import { ApiErrorWithMetadata } from '../types';

export type ApiContextType = {
  handlers: {
    onError?: (errors: ApiErrorWithMetadata[]) => void;
    onSuccess?: (data: unknown) => void;
    onComplete?: () => void;
  };
};
