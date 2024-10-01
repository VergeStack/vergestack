import { ApiError } from '@vergestack/api';

type ApiErrorWithoutReason = Omit<ApiError, 'reason'>;
type ApiErrorWithReason = ApiError & {
  reason: string;
  isReasonRegistered: boolean;
};

export type ApiErrorWithMetadata = ApiErrorWithoutReason | ApiErrorWithReason;
