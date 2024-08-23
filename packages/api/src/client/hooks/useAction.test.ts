import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  createAction,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  VisibleInternalError
} from '../..';

describe('useAction', () => {
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
