import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  VisibleInternalError
} from '../types';
import { wrapRoute } from './routes';

describe('wrapRoute', () => {
  const inputSchema = z.object({ name: z.string() });
  const outputSchema = z.object({ greeting: z.string() });
  const greetingFunction = async (input: { name: string }) => {
    return { greeting: `Hello, ${input.name}!` };
  };

  it('should successfully handle valid input and output', async () => {
    const route = wrapRoute(inputSchema, outputSchema, greetingFunction);
    const mockRequest = {
      json: async () => ({ name: 'Alice' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual({
      status: StatusCodes.OK,
      data: { greeting: 'Hello, Alice!' }
    });
    expect(statusCode).toEqual(StatusCodes.OK);
  });

  it('should return an error for invalid input', async () => {
    const route = wrapRoute(inputSchema, outputSchema, greetingFunction);
    const mockRequest = {
      json: async () => ({ name: 123 })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual({
      status: StatusCodes.BAD_REQUEST,
      errors: [{ message: 'Expected string, received number', reason: 'name' }]
    });
    expect(statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  it('should return an error for invalid output', async () => {
    const invalidFunction = async () => ({ invalidKey: 'Invalid data' });
    const route = wrapRoute(
      inputSchema,
      outputSchema,
      invalidFunction as unknown as (input: {
        name: string;
      }) => Promise<{ greeting: string }>
    );
    const mockRequest = {
      json: async () => ({ name: 'Bob' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: [{ message: ReasonPhrases.INTERNAL_SERVER_ERROR }]
    });
    expect(statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should handle native errors', async () => {
    const errorFunction = async () => {
      throw new Error('Something went wrong');
    };
    const route = wrapRoute(inputSchema, outputSchema, errorFunction);
    const mockRequest = {
      json: async () => ({ name: 'Charlie' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: [{ message: ReasonPhrases.INTERNAL_SERVER_ERROR }]
    });
    expect(statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should handle VisibleInternalError', async () => {
    const errorFunction = async () => {
      throw new VisibleInternalError('Visible internal error');
    };
    const route = wrapRoute(inputSchema, outputSchema, errorFunction);
    const mockRequest = {
      json: async () => ({ name: 'David' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: [{ message: 'Visible internal error' }]
    });
    expect(statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should handle UnauthorizedError', async () => {
    const errorFunction = async () => {
      throw new UnauthorizedError('Unauthorized error');
    };
    const route = wrapRoute(inputSchema, outputSchema, errorFunction);
    const mockRequest = {
      json: async () => ({ name: 'Eve' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual({
      status: StatusCodes.UNAUTHORIZED,
      errors: [{ message: 'Unauthorized error' }]
    });
    expect(statusCode).toEqual(StatusCodes.UNAUTHORIZED);
  });

  it('should handle ForbiddenError', async () => {
    const errorFunction = async () => {
      throw new ForbiddenError('Forbidden error');
    };
    const route = wrapRoute(inputSchema, outputSchema, errorFunction);
    const mockRequest = {
      json: async () => ({ name: 'Frank' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual({
      status: StatusCodes.FORBIDDEN,
      errors: [{ message: 'Forbidden error' }]
    });
    expect(statusCode).toEqual(StatusCodes.FORBIDDEN);
  });

  it('should handle NotFoundError', async () => {
    const errorFunction = async () => {
      throw new NotFoundError('Not found error');
    };
    const route = wrapRoute(inputSchema, outputSchema, errorFunction);
    const mockRequest = {
      json: async () => ({ name: 'Grace' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual({
      status: StatusCodes.NOT_FOUND,
      errors: [{ message: 'Not found error' }]
    });
    expect(statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
