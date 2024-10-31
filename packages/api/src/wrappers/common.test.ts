import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  VisibleInternalError
} from '../types';
import { execute } from './common';

describe('execute', () => {
  const inputSchema = z.object({ name: z.string() });
  const outputSchema = z.object({ greeting: z.string() });
  const greetingFunction = async ({ input }: { input: { name: string } }) => {
    return { greeting: `Hello, ${input.name}!` };
  };

  it('should successfully handle valid input and output', async () => {
    const result = await execute(inputSchema, outputSchema, greetingFunction, {
      input: { name: 'Alice' }
    });
    expect(result).toEqual({
      status: StatusCodes.OK,
      data: { greeting: 'Hello, Alice!' }
    });
  });

  it('should return an error for invalid input', async () => {
    const result = await execute(inputSchema, outputSchema, greetingFunction, {
      input: {
        // @ts-expect-error: Intentionally passing invalid input for testing
        name: 123
      }
    });
    expect(result).toEqual({
      status: StatusCodes.BAD_REQUEST,
      errors: [{ message: 'Expected string, received number', reason: 'name' }]
    });
  });

  it('should handle generic errors thrown by the function', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn());
    const errorFunction = async ({
      input: _input
    }: {
      input: { name: string };
    }) => {
      throw new Error('Unexpected error');
    };
    const result = await execute(inputSchema, outputSchema, errorFunction, {
      input: { name: 'Charlie' }
    });
    expect(result).toEqual({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: [{ message: ReasonPhrases.INTERNAL_SERVER_ERROR }]
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should return an error for invalid output', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn());
    const invalidFunction = async () => ({ invalidKey: 'Invalid data' });
    // @ts-expect-error: Intentionally passing invalid output for testing
    const result = await execute(inputSchema, outputSchema, invalidFunction, {
      input: { name: 'David' }
    });
    expect(result).toEqual({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: [{ message: ReasonPhrases.INTERNAL_SERVER_ERROR }]
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle VisibleInternalError thrown by the function', async () => {
    const errorFunction = async () => {
      throw new VisibleInternalError('Internal error message', 'custom/path');
    };
    const result = await execute(inputSchema, outputSchema, errorFunction, {
      input: { name: 'Bob' }
    });
    expect(result).toEqual({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: [{ message: 'Internal error message', reason: 'custom/path' }]
    });
  });

  it('should handle UnauthorizedError thrown by the function', async () => {
    const errorFunction = async () => {
      throw new UnauthorizedError('Unauthorized access message', 'auth/token');
    };
    const result = await execute(inputSchema, outputSchema, errorFunction, {
      input: { name: 'Alice' }
    });
    expect(result).toEqual({
      status: StatusCodes.UNAUTHORIZED,
      errors: [{ message: 'Unauthorized access message', reason: 'auth/token' }]
    });
  });

  it('should handle ForbiddenError thrown by the function', async () => {
    const errorFunction = async () => {
      throw new ForbiddenError('Access forbidden message', 'user/permissions');
    };
    const result = await execute(inputSchema, outputSchema, errorFunction, {
      input: { name: 'Bob' }
    });
    expect(result).toEqual({
      status: StatusCodes.FORBIDDEN,
      errors: [
        { message: 'Access forbidden message', reason: 'user/permissions' }
      ]
    });
  });

  it('should handle NotFoundError thrown by the function', async () => {
    const errorFunction = async () => {
      throw new NotFoundError('Resource not found message', 'data/id');
    };
    const result = await execute(inputSchema, outputSchema, errorFunction, {
      input: { name: 'Charlie' }
    });
    expect(result).toEqual({
      status: StatusCodes.NOT_FOUND,
      errors: [{ message: 'Resource not found message', reason: 'data/id' }]
    });
  });
});
