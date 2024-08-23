'use server';

import { createAction } from '@vergestack/api/dist/server';
import { z } from 'zod';

export const errorAction = createAction()
  .input(z.string())
  .output(z.string())
  .handler(async () => {
    throw new Error('Hello, world!');
  });
