'use server';

import { createAction } from '@vergestack/api';
import { z } from 'zod';

export const errorAction = createAction()
  .input(z.string())
  .output(z.string())
  .handler(async () => {
    throw new Error('Hello, world!');
  });
