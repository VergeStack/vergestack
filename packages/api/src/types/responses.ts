import { StatusCodes } from 'http-status-codes';

export type ApiResponseSuccessCodes =
  | StatusCodes.OK
  | StatusCodes.CREATED
  | StatusCodes.ACCEPTED
  | StatusCodes.NON_AUTHORITATIVE_INFORMATION
  | StatusCodes.NO_CONTENT
  | StatusCodes.RESET_CONTENT
  | StatusCodes.PARTIAL_CONTENT
  | StatusCodes.MULTI_STATUS;

export type ApiResponseErrorCodes =
  | StatusCodes.BAD_REQUEST
  | StatusCodes.NOT_FOUND
  | StatusCodes.FORBIDDEN
  | StatusCodes.UNAUTHORIZED
  | StatusCodes.INTERNAL_SERVER_ERROR;

export type ApiResponseStatus = ApiResponseSuccessCodes | ApiResponseErrorCodes;

export type ApiError = {
  message: string;
  reason?: string;
};

export type ApiResponseError = {
  status: ApiResponseErrorCodes;
  data?: never;
  errors: ApiError[];
};

export type ApiResponseSuccess<T> = {
  status: ApiResponseSuccessCodes;
  data: T;
  errors?: never;
};

export type ApiResponse<T> = ApiResponseError | ApiResponseSuccess<T>;
