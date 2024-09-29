import { StatusCodes } from 'http-status-codes';

export type ApiResponseErrorCodes =
  | StatusCodes.BAD_REQUEST
  | StatusCodes.NOT_FOUND
  | StatusCodes.FORBIDDEN
  | StatusCodes.UNAUTHORIZED
  | StatusCodes.INTERNAL_SERVER_ERROR;

export type ErrorMessage = {
  message: string;
  path?: string;
};

export type ApiResponseError = {
  status: ApiResponseErrorCodes;
  data?: never;
  errors: ErrorMessage[];
};

export type ApiResponseSuccess<T> = {
  status: StatusCodes.OK;
  data: T;
  errors?: never;
};

export type ApiResponse<T> = ApiResponseError | ApiResponseSuccess<T>;
