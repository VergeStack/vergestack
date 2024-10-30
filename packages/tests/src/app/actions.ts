'use server';

import { createAction } from '@vergestack/api';
import { z } from 'zod';

export const successAction = createAction()
  .input(z.string())
  .output(z.string())
  .handler(async ({ input }) => {
    return `Hello, ${input}!`;
  });

export const delayAction = createAction()
  .input(z.string())
  .output(z.string())
  .handler(async ({ input }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `Hello, ${input}!`;
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

export const successFormAction = createAction()
  .input(
    z.object({
      name: z.string().min(3)
    })
  )
  .output(z.string())
  .handler(async ({ input }) => {
    return `Hello, ${input.name}!`;
  });
