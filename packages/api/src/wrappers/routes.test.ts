import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  VisibleInternalError
} from '../types';
import { ApiHandler } from './common';
import { createRoute } from './routes';

describe('createRoute', () => {
  const inputSchema = z.object({ name: z.string() });
  const outputSchema = z.object({ greeting: z.string() });
  const greetingFunction = async ({ input }: { input: { name: string } }) => {
    return { greeting: `Hello, ${input.name}!` };
  };

  it('should successfully handle valid input and output', async () => {
    const route = createRoute()
      .input(inputSchema)
      .output(outputSchema)
      .handler(greetingFunction);
    const mockRequest = {
      json: async () => ({ name: 'Alice' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual({ greeting: 'Hello, Alice!' });
    expect(statusCode).toEqual(StatusCodes.OK);
  });

  it('should return an error for invalid input', async () => {
    const route = createRoute()
      .input(inputSchema)
      .output(outputSchema)
      .handler(greetingFunction);
    const mockRequest = {
      json: async () => ({ name: 123 })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual([
      { message: 'Expected string, received number', reason: 'name' }
    ]);
    expect(statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  it('should return an error for invalid output', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn());
    const invalidFunction = async () => ({ invalidKey: 'Invalid data' });
    const route = createRoute()
      .input(inputSchema)
      .output(outputSchema)
      .handler(
        invalidFunction as unknown as ApiHandler<
          { name: string },
          { greeting: string }
        >
      );
    const mockRequest = {
      json: async () => ({ name: 'Bob' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual([
      { message: ReasonPhrases.INTERNAL_SERVER_ERROR }
    ]);
    expect(statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle native errors', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn());
    const errorFunction = async () => {
      throw new Error('Something went wrong');
    };
    const route = createRoute()
      .input(inputSchema)
      .output(outputSchema)
      .handler(errorFunction);
    const mockRequest = {
      json: async () => ({ name: 'Charlie' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual([
      { message: ReasonPhrases.INTERNAL_SERVER_ERROR }
    ]);
    expect(statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle VisibleInternalError', async () => {
    const errorFunction = async () => {
      throw new VisibleInternalError('Visible internal error');
    };
    const route = createRoute()
      .input(inputSchema)
      .output(outputSchema)
      .handler(errorFunction);
    const mockRequest = {
      json: async () => ({ name: 'David' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual([{ message: 'Visible internal error' }]);
    expect(statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should handle UnauthorizedError', async () => {
    const errorFunction = async () => {
      throw new UnauthorizedError('Unauthorized error');
    };
    const route = createRoute()
      .input(inputSchema)
      .output(outputSchema)
      .handler(errorFunction);
    const mockRequest = {
      json: async () => ({ name: 'Eve' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual([{ message: 'Unauthorized error' }]);
    expect(statusCode).toEqual(StatusCodes.UNAUTHORIZED);
  });

  it('should handle ForbiddenError', async () => {
    const errorFunction = async () => {
      throw new ForbiddenError('Forbidden error');
    };
    const route = createRoute()
      .input(inputSchema)
      .output(outputSchema)
      .handler(errorFunction);
    const mockRequest = {
      json: async () => ({ name: 'Frank' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual([{ message: 'Forbidden error' }]);
    expect(statusCode).toEqual(StatusCodes.FORBIDDEN);
  });

  it('should handle NotFoundError', async () => {
    const errorFunction = async () => {
      throw new NotFoundError('Not found error');
    };
    const route = createRoute()
      .input(inputSchema)
      .output(outputSchema)
      .handler(errorFunction);
    const mockRequest = {
      json: async () => ({ name: 'Grace' })
    } as unknown as NextRequest;
    const result = await route(mockRequest);

    const responseBody = await result.json();
    const statusCode = result.status;

    expect(responseBody).toEqual([{ message: 'Not found error' }]);
    expect(statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
