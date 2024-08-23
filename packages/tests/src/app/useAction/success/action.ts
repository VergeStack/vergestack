'use server';

import { createAction } from '@vergestack/api/dist/server';
import { z } from 'zod';

export const successAction = createAction()
  .input(z.string())
  .output(z.string())
  .handler(async (name) => {
    return `Hello, ${name}!`;
  });
