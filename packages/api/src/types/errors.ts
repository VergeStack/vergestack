import { StatusCodes } from 'http-status-codes';
import { ApiResponseErrorCodes } from './responses';

export abstract class ApiError extends Error {
  readonly status: ApiResponseErrorCodes = StatusCodes.INTERNAL_SERVER_ERROR;
  readonly path?: string;

  constructor(message: string, status: ApiResponseErrorCodes, path?: string) {
    super(message);
    this.status = status;
    this.path = path;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string, path?: string) {
    super(message, StatusCodes.UNAUTHORIZED, path);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string, path?: string) {
    super(message, StatusCodes.FORBIDDEN, path);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string, path?: string) {
    super(message, StatusCodes.NOT_FOUND, path);
    this.name = 'NotFoundError';
  }
}

export class VisibleInternalError extends ApiError {
  constructor(message: string, path?: string) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, path);
    this.name = 'InternalError';
  }
}
