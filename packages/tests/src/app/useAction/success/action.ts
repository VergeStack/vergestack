'use server';

import { createAction } from '@vergestack/api';
import { z } from 'zod';

export const successAction = createAction()
  .input(z.string())
  .output(z.string())
  .handler(async (name) => {
    return `Hello, ${name}!`;
  });