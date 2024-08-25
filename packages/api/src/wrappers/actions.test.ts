import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  VisibleInternalError
} from '../types';
import { createAction, wrapAction } from './actions';

describe('wrapAction', () => {
  const inputSchema = z.object({ name: z.string() });
  const outputSchema = z.object({ greeting: z.string() });
  const greetingFunction = async (input: { name: string }) => {
    return { greeting: `Hello, ${input.name}!` };
  };

  it('should successfully handle valid input and output', async () => {
    const action = wrapAction(inputSchema, outputSchema, greetingFunction);
    const result = await action({ name: 'Alice' });
    expect(result).toEqual({
      status: StatusCodes.OK,
      data: { greeting: 'Hello, Alice!' }
    });
  });

  it('should throw an error for invalid input', async () => {
    const action = wrapAction(inputSchema, outputSchema, greetingFunction);

    // @ts-expect-error: Intentionally passing invalid input for testing
    const result = await action({ name: 123 });
    expect(result).toEqual({
      status: StatusCodes.BAD_REQUEST,
      errors: [{ message: 'Expected string, received number', path: 'name' }]
    });
  });

  it('should throw an error for invalid output', async () => {
    const invalidFunction = async () => ({ invalidKey: 'Invalid data' });
    const action = wrapAction(
      inputSchema,
      outputSchema,
      invalidFunction as unknown as (input: {
        name: string;
      }) => Promise<{ greeting: string }>
    );

    const result = await action({ name: 'Bob' });
    expect(result).toEqual({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: [{ message: ReasonPhrases.INTERNAL_SERVER_ERROR }]
    });
  });
});

describe('createAction', () => {
  test('success', async () => {
    const greetingAction = createAction()
      .input(z.string())
      .output(z.string())
      .handler(async (name) => {
        return `Hello, ${name}!`;
      });

    const result = await greetingAction('World');

    expect(result.status).toBe(StatusCodes.OK);
    expect(result.data).toBe('Hello, World!');
    expect(result.errors).toBeUndefined();
  });

  test('native error', async () => {
    const greetingAction = createAction()
      .input(z.void())
      .output(z.void())
      .handler(async () => {
        throw new Error('Something went wrong');
      });

    const result = await greetingAction();

    expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(result.data).toBeUndefined();
    expect(result.errors).toEqual([
      {
        message: ReasonPhrases.INTERNAL_SERVER_ERROR
      }
    ]);
  });

  test('visible internal error', async () => {
    const greetingAction = createAction()
      .input(z.void())
      .output(z.void())
      .handler(async () => {
        throw new VisibleInternalError('Something went wrong');
      });

    const result = await greetingAction();

    expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(result.data).toBeUndefined();
    expect(result.errors).toEqual([
      {
        message: 'Something went wrong'
      }
    ]);
  });

  test('unauthorized error', async () => {
    const greetingAction = createAction()
      .input(z.void())
      .output(z.void())
      .handler(async () => {
        throw new UnauthorizedError('Unauthorized error');
      });

    const result = await greetingAction();

    expect(result.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(result.data).toBeUndefined();
    expect(result.errors).toEqual([
      {
        message: 'Unauthorized error'
      }
    ]);
  });

  test('forbidden error', async () => {
    const greetingAction = createAction()
      .input(z.void())
      .output(z.void())
      .handler(async () => {
        throw new ForbiddenError('Forbidden error');
      });

    const result = await greetingAction();

    expect(result.status).toBe(StatusCodes.FORBIDDEN);
    expect(result.data).toBeUndefined();
    expect(result.errors).toEqual([
      {
        message: 'Forbidden error'
      }
    ]);
  });

  test('not found error', async () => {
    const greetingAction = createAction()
      .input(z.void())
      .output(z.void())
      .handler(async () => {
        throw new NotFoundError('Not found error');
      });

    const result = await greetingAction();

    expect(result.status).toBe(StatusCodes.NOT_FOUND);
    expect(result.data).toBeUndefined();
    expect(result.errors).toEqual([
      {
        message: 'Not found error'
      }
    ]);
  });
});
