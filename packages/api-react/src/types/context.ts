import { ApiErrorWithMetadata } from '../types';

export type ApiContextType = {
  options: {
    onError?: (errors: ApiErrorWithMetadata[]) => void;
    onSuccess?: (data: unknown) => void;
    onComplete?: () => void;
  };
};
