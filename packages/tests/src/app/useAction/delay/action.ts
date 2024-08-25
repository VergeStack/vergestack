'use server';

import { createAction } from '@vergestack/api';
import { z } from 'zod';

export const delayAction = createAction()
  .input(z.string())
  .output(z.string())
  .handler(async (name) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return `Hello, ${name}!`;
  });
