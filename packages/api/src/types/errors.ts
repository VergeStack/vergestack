import { StatusCodes } from 'http-status-codes';
import { ApiResponseErrorCodes } from './responses';

export abstract class GenericError extends Error {
  readonly status: ApiResponseErrorCodes = StatusCodes.INTERNAL_SERVER_ERROR;
  readonly reason?: string;

  constructor(
    name: string,
    message: string,
    status: ApiResponseErrorCodes,
    reason?: string
  ) {
    super(message);
    this.name = name;
    this.status = status;
    this.reason = reason;
  }
}

export class UnauthorizedError extends GenericError {
  constructor(message: string, reason?: string) {
    super('UnauthorizedError', message, StatusCodes.UNAUTHORIZED, reason);
  }
}

export class ForbiddenError extends GenericError {
  constructor(message: string, reason?: string) {
    super('ForbiddenError', message, StatusCodes.FORBIDDEN, reason);
  }
}

export class BadRequestError extends GenericError {
  constructor(message: string, reason?: string) {
    super('BadRequestError', message, StatusCodes.BAD_REQUEST, reason);
  }
}

export class NotFoundError extends GenericError {
  constructor(message: string, reason?: string) {
    super('NotFoundError', message, StatusCodes.NOT_FOUND, reason);
  }
}

export class VisibleInternalError extends GenericError {
  constructor(message: string, reason?: string) {
    super(
      'VisibleInternalError',
      message,
      StatusCodes.INTERNAL_SERVER_ERROR,
      reason
    );
  }
}
