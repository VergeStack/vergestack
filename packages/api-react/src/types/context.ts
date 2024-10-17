import { ApiErrorWithMetadata } from '../types';

export type ApiContextType = {
  options: {
    onStart?: () => void;
    onError?: (errors: ApiErrorWithMetadata[]) => void;
    onSuccess?: (data: unknown) => void;
    onComplete?: () => void;
  };
};
