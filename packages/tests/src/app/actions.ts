'use server';

import { createAction } from '@vergestack/api';
import { z } from 'zod';

export const successAction = createAction()
  .input(z.string())
  .output(z.string())
  .handler(async (name) => {
    return `Hello, ${name}!`;
  });

export const delayAction = createAction()
  .input(z.string())
  .output(z.string())
  .handler(async (name) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `Hello, ${name}!`;
  });

export const errorAction = createAction()
  .input(z.string())
  .output(z.string())
  .handler(async () => {
    throw new Error('Hello, world!');
  });

export const undefinedOutputAction = createAction()
  .input(z.string())
  .output(z.undefined())
  .handler(async () => {
    return undefined;
  });
